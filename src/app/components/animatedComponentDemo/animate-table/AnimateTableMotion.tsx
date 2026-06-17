'use client'

import { motion, Variants } from 'framer-motion'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import Image from 'next/image'

const tableVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.25 },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const products = [
  {
    name: 'Apple MacBook Pro 17"',
    color: 'Silver',
    category: 'Laptop',
    badgeColor: 'bg-primary/10 text-primary',
    price: '$2999',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/profile/user-1.jpg',
    },
  },
  {
    name: 'Microsoft Surface Pro',
    color: 'White',
    category: 'Laptop PC',
    badgeColor: 'bg-secondary/10 text-secondary',
    price: '$1999',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      image: '/images/profile/user-2.jpg',
    },
  },
  {
    name: 'Magic Mouse 2',
    color: 'Black',
    category: 'Accessories',
    badgeColor: 'bg-success/10 text-success',
    price: '$99',
    user: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      image: '/images/profile/user-3.jpg',
    },
  },
  {
    name: 'iPad Pro 12.9',
    color: 'Space Gray',
    category: 'Tablet',
    badgeColor: 'bg-warning/10 text-warning',
    price: '$1099',
    user: {
      name: 'Michael Brown',
      email: 'michael@example.com',
      image: '/images/profile/user-4.jpg',
    },
  },
  {
    name: 'AirPods Pro',
    color: 'White',
    category: 'Accessories',
    badgeColor: 'bg-success/10 text-success',
    price: '$249',
    user: {
      name: 'Emma Wilson',
      email: 'emma@example.com',
      image: '/images/profile/user-5.jpg',
    },
  },
]

export default function AnimateTableMotion({ replayAnimation = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='rounded-md overflow-hidden shadow'
      key={replayAnimation}>
      <Table className='overflow-hidden'>
        <TableHeader className='bg-primary/10'>
          <TableRow>
            <TableHead>User Info</TableHead>
            <TableHead>Product name</TableHead>
            <TableHead> Color</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>
              <span className='sr-only'>Edit</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <motion.tbody variants={tableVariants} initial='hidden' animate='show'>
          {products.map((product, idx) => (
            <motion.tr
              key={idx}
              variants={rowVariants}
              className='bg-white dark:bg-gray-800'>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Image
                    src={product.user.image}
                    width={36}
                    height={36}
                    className='rounded-full'
                    alt='user'
                  />
                  <div className='flex flex-col'>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {product.user.name}
                    </span>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {product.user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className='font-medium text-gray-900 dark:text-white'>
                {product.name}
              </TableCell>
              <TableCell>{product.color}</TableCell>
              <TableCell>
                <span
                  className={`py-1 text-xs px-3 rounded-full ${product.badgeColor}`}>
                  {product.category}
                </span>
              </TableCell>
              <TableCell>{product.price}</TableCell>

              <TableCell>
                <a
                  href='#'
                  className='font-medium text-primary hover:underline dark:text-primary'>
                  Edit
                </a>
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>
    </motion.div>
  )
}
