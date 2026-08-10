import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import Title from './Title'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
// import required modules
import { Autoplay } from 'swiper/modules';
import Item from './Item'
const RelatedBooks = ({ book, id }) => {
    const [relatedBooks, setRelatedBooks] = useState([])
    const { books } = useContext(ShopContext)

    useEffect(() => {
        if (books.length > 0) {
            let booksCopy = books.slice()
            booksCopy = booksCopy.filter((item) => item.category === book.category && id !== item._id)
            setRelatedBooks(booksCopy.slice(0, 6))
        }
    }, [books])
    return (
        <section className=' py-16'>
            <Title
                title1={"Related"}
                title2={"Books"} />
            {/* CONTAINER */}
            {
                <Swiper
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        355: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        600: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                        900: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                        1200: {
                            slidesPerView: 5,
                            spaceBetween: 30,
                        }
                    }}
                    modules={[Autoplay]}
                    className="min-h-[380px] mt-4 py-6 px-1">
                    {
                        relatedBooks.map((book) => (
                            <SwiperSlide key={book._id}>
                                <Item book={book} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            }
        </section>
    )
}

export default RelatedBooks