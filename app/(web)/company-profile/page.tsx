// "use client"

// import Main from './Main'
// import Header from '../../components/header/Header';
// import Footer from '../../components/footer/Footer'

// const Page = () => {
//     return (
//         <>
//             <Header />
            
//                 <Main />
            
//             <Footer />
//         </>
//     )
// }

// export default Page;



"use client";

// import React, { useState } from "react";
import Main from './Main';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const Page = () => {
   
    return (
        <>
            <Header />
            <div className="container py-5">
                <Main />
            </div>
            <Footer />
        </>
    );
};

export default Page;
