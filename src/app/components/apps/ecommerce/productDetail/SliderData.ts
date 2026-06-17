
interface DataType {
    id: number;
    imgPath: any;
  }
  
  import img1 from "/public/images/products/s1.jpg"
  import img2 from "/public/images/products/s2.jpg"
  import img3 from "/public/images/products/s3.jpg"
  import img4 from "/public/images/products/s4.jpg"
  import img5 from "/public/images/products/s5.jpg"
  import img6 from "/public/images/products/s6.jpg"
  import img7 from "/public/images/products/s7.jpg"
  
  const SliderData: DataType[] = [
    {
      imgPath: '/images/products/s1.jpg',
      id: 1,
    },
    {
      imgPath: '/images/products/s2.jpg',
      id: 2,
    },
    {
      imgPath: '/images/products/s3.jpg',
      id: 3,
    },
    {
      imgPath: '/images/products/s4.jpg',
      id: 4,
    },
    {
      imgPath: '/images/products/s5.jpg',
      id: 5,
    },
    {
      imgPath: '/images/products/s6.jpg',
      id: 6,
    },
    {
      imgPath: '/images/products/s7.jpg',
      id: 7,
    },
  ];
  
  export default SliderData;
  