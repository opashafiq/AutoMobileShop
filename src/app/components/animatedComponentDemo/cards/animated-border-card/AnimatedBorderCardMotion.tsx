
import { Card } from "@/components/ui/card";
import "./border-card-animation.css"
import { Facebook, Instagram, Github, Twitter } from 'lucide-react';
import Image from "next/image";


export default function AnimatedBorderCardMotion() {
    return (
        <>
            <Card className="border-card !p-0 max-w-md">
                <div className="media-object">
                    <div className="w-full">
                        <div className="card hover-img bg-transparent shadow rounded-[12px] overflow-hidden">
                            <div className="card-body p-4 text-center border-b">
                                <Image
                                    src="/images/profile/emily.png"
                                    alt="betty adams"
                                    className="rounded-full mb-3 mx-auto"
                                    width="80"
                                    height="80"
                                />
                                <h4 className="text-lg font-semibold mb-1">Betty Adams</h4>
                                <span className="text-sm text-gray-500">Medical Secretary</span>
                            </div>
                            <ul className="flex items-center justify-center space-x-3 px-2 py-3 list-none m-0">
                                <li>
                                    <a
                                        href="javascript:void(0)"
                                        className="text-blue-600 hover:bg-blue-100 p-2 rounded-full flex items-center justify-center text-xl"
                                    >
                                        <Facebook size={20} />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="javascript:void(0)"
                                        className="text-pink-500 hover:bg-pink-100 p-2 rounded-full flex items-center justify-center text-xl"
                                    >
                                        <Instagram size={20} />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="javascript:void(0)"
                                        className="text-gray-600 hover:bg-gray-200 p-2 rounded-full flex items-center justify-center text-xl"
                                    >
                                        <Github size={20} />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="javascript:void(0)"
                                        className="text-gray-500 hover:bg-gray-200 p-2 rounded-full flex items-center justify-center text-xl"
                                    >
                                        <Twitter size={20} />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}
