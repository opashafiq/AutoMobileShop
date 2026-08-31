'use client'
import React, { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { BlogType, BlogPostType } from '../../(DashboardLayout)/types/apps/blog';
import { getFetcher } from '@/app/api/globalFetcher';
import useSWR from 'swr'

// Define BlogContextProps interface
export interface BlogContextProps {
    posts: BlogPostType[];
    sortBy: string;
    selectedPost: BlogPostType | null;
    isLoading: boolean;
    setPosts: Dispatch<SetStateAction<BlogPostType[]>>;
    setSortBy: Dispatch<SetStateAction<string>>;
    setSelectedPost: Dispatch<SetStateAction<BlogPostType | null>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    addComment: (postId: number, newComment: BlogType) => void;
    fetchPostById: (id: number) => void;
    error:null
}

// Create context with default values
export const BlogContext = createContext<BlogContextProps>({
    posts: [],
    sortBy: 'newest',
    selectedPost: null,
    isLoading: true,
    setPosts: () => { },
    setSortBy: () => { },
    setSelectedPost: () => { },
    setLoading: () => { },
    addComment: () => { },
    fetchPostById: (id:number) => { },
    error:null
});

// BlogProvider component
export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<BlogPostType[]>([]);
    const [sortBy, setSortBy] = useState<string>('newest');
    const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    // Fetch Post data from the API
    const {data:postsData,isLoading:isPostsLoading , error:postsError} = useSWR('/api/blog',getFetcher);

    useEffect(() => {
        if(postsData){
            setPosts(postsData.data);
            setLoading(isPostsLoading);
        }
        else if(postsError){
          setError(postsError);
          setLoading(isPostsLoading);
        }
        else{
            setLoading(isPostsLoading);
        }
    }, [postsData,postsError]);

    // Adds a new comment to a specific post by updating the state.
    const addComment = (postId: number, newComment: BlogType) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, comments: [newComment, ...(post.comments || [])] } : post
            )
        );
    }

    // Fetches a specific blog post by its id from the API endpoint and updates
    // the selected post in the state. The SWR call itself must live at the top
    // of the provider (a hook can't be defined inside a plain function).
    const [postId, setPostId] = useState<number | null>(null);

    const { data: specificPostData, isLoading: isSpecificPostLoading, error: isSpecificPostError } =
        useSWR(postId != null ? `/api/blog/${postId}` : null, getFetcher);

    useEffect(() => {
        // No reader has requested a post yet — leave the posts-list loading alone.
        if (postId == null) return;

        if (specificPostData) {
            setSelectedPost(specificPostData);
            setLoading(isSpecificPostLoading);
        } else if (isSpecificPostError) {
            setError(isSpecificPostError);
            setLoading(isSpecificPostLoading);
        } else {
            setLoading(isSpecificPostLoading);
        }
    }, [postId, specificPostData, isSpecificPostError, isSpecificPostLoading]);

    const fetchPostById = (id: number) => {
        setPostId(id);
    };

    const value: BlogContextProps = {
        posts,
        sortBy,
        selectedPost,
        isLoading,
        setPosts,
        setSortBy,
        setSelectedPost,
        setLoading,
        addComment,
        fetchPostById,
        error
    };

    return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
