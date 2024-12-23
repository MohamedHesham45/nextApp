"use client";

import React, {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { user } = useUser();
  const [prevScrollPos, setPrevScrollPos] =
    useState(0);
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const isAuthorized = (user) => {
    if (!user) return false;
    const authorizedEmails = [
      "aliellool202020@gmail.com",
      "sitaramall97@gmail.com",
      "mohmedadm733@gmail.com",
      "muhammedreda6@gmail.com"
    ];
    return authorizedEmails.includes(
      user.primaryEmailAddress?.emailAddress
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(
        prevScrollPos > currentScrollPos ||
          currentScrollPos < 10
      );
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );
    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [prevScrollPos]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`bg-white shadow fixed w-full z-50 transition-transform duration-300 ${
        visible
          ? "translate-y-0"
          : "-translate-y-full"
      }`}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-700">
            <Link href="/">ستارة مول</Link>
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            <Link
              href="/gallery"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
            >
              المعرض
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
            >
              تواصل معنا
            </Link>
            <SignedIn>
              {isAuthorized(user) && (
                <Link
                  href="/admin/orders"
                  className="text-gray-800 hover:text-gray-600 transition duration-300"
                >
                  إدارة الطلبات
                </Link>
              )}
              {isAuthorized(user) && (
                <Link
                  href="/verify-passcode"
                  className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
                >
                  إدارة المحتوى
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-gray-800 hover:text-gray-600 transition duration-300"
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-800"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <Link
              href="/gallery"
              className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
            >
              المعرض
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
            >
              تواصل معنا
            </Link>
            <SignedIn>
              {isAuthorized(user) && (
                <Link
                  href="/admin/orders"
                  className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
                >
                  إدارة الطلبات
                </Link>
              )}
              {isAuthorized(user) && (
                <Link
                  href="/verify-passcode"
                  className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
                >
                  إدارة المحتوى
                </Link>
              )}

              <div className="py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
        )}
      </nav>
    </header>
  );
}

// "use client";

// import React, {
//   useState,
//   useEffect,
// } from "react";
// import Link from "next/link";
// import {
//   SignedIn,
//   SignedOut,
//   UserButton,
//   useUser,
// } from "@clerk/nextjs";
// import { Menu } from "lucide-react";

// export default function Navbar() {
//   const { user } = useUser();
//   const [prevScrollPos, setPrevScrollPos] =
//     useState(0);
//   const [visible, setVisible] = useState(true);
//   const [isMenuOpen, setIsMenuOpen] =
//     useState(false);

//   const isAuthorized = (user) => {
//     if (!user) return false;
//     const authorizedEmails = [
//       "aliellool202020@gmail.com",
//       "sitaramall97@gmail.com",
//     ];
//     return authorizedEmails.includes(
//       user.primaryEmailAddress?.emailAddress
//     );
//   };

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollPos = window.pageYOffset;
//       setVisible(
//         prevScrollPos > currentScrollPos ||
//           currentScrollPos < 10
//       );
//       setPrevScrollPos(currentScrollPos);
//     };

//     window.addEventListener(
//       "scroll",
//       handleScroll
//     );
//     return () =>
//       window.removeEventListener(
//         "scroll",
//         handleScroll
//       );
//   }, [prevScrollPos]);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   return (
//     <header
//       className={`bg-white shadow fixed w-full z-50 transition-transform duration-300 ${
//         visible
//           ? "translate-y-0"
//           : "-translate-y-full"
//       }`}
//     >
//       <nav className="container mx-auto px-6 py-3">
//         <div className="flex justify-between items-center">
//           <div className="text-xl font-semibold text-gray-700">
//             <Link href="/">ستارة مول</Link>
//           </div>
//           <div className="hidden md:flex space-x-4 items-center">
//             <Link
//               href="/gallery"
//               className="text-gray-800 hover:text-gray-600 transition duration-300"
//             >
//               المعرض
//             </Link>
//             <Link
//               href="/contact"
//               className="text-gray-800 hover:text-gray-600 transition duration-300"
//             >
//               تواصل معنا
//             </Link>
//             <SignedIn>
//               <Link
//                 href="/user/orders"
//                 className="text-gray-800 hover:text-gray-600 transition duration-300"
//               >
//                 طلباتي
//               </Link>
//               {isAuthorized(user) && (
//                 <Link
//                   href="/verify-passcode"
//                   className="text-gray-800 hover:text-gray-600 transition duration-300"
//                 >
//                   Admin Access
//                 </Link>
//               )}
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//             <SignedOut>
//               <Link
//                 href="/sign-in"
//                 className="text-gray-800 hover:text-gray-600 transition duration-300"
//               >
//                 Sign In
//               </Link>
//             </SignedOut>
//           </div>
//           <div className="md:hidden">
//             <button
//               onClick={toggleMenu}
//               className="text-gray-800"
//             >
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>
//         {isMenuOpen && (
//           <div className="md:hidden mt-4">
//             <Link
//               href="/gallery"
//               className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
//             >
//               المعرض
//             </Link>
//             <Link
//               href="/contact"
//               className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
//             >
//               تواصل معنا
//             </Link>
//             <SignedIn>
//               <Link
//                 href="/user/orders"
//                 className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
//               >
//                 طلباتي
//               </Link>
//               {isAuthorized(user) && (
//                 <Link
//                   href="/verify-passcode"
//                   className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
//                 >
//                   Admin Access
//                 </Link>
//               )}
//               <div className="py-2">
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             </SignedIn>
//             <SignedOut>
//               <Link
//                 href="/sign-in"
//                 className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
//               >
//                 Sign In
//               </Link>
//             </SignedOut>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// }

// // "use client";

// // import React, {
// //   useState,
// //   useEffect,
// // } from "react";
// // import Link from "next/link";
// // import {
// //   SignedIn,
// //   SignedOut,
// //   UserButton,
// //   useUser,
// // } from "@clerk/nextjs";
// // import { Menu } from "lucide-react";

// // export default function Navbar() {
// //   const { user } = useUser();
// //   const [prevScrollPos, setPrevScrollPos] =
// //     useState(0);
// //   const [visible, setVisible] = useState(true);
// //   const [isMenuOpen, setIsMenuOpen] =
// //     useState(false);

// //   const isAuthorized = (user) => {
// //     if (!user) return false;
// //     const authorizedEmails = [
// //       "aliellool202020@gmail.com",
// //       "sitaramall97@gmail.com",
// //     ];
// //     return authorizedEmails.includes(
// //       user.primaryEmailAddress?.emailAddress
// //     );
// //   };

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       const currentScrollPos = window.pageYOffset;
// //       setVisible(
// //         prevScrollPos > currentScrollPos ||
// //           currentScrollPos < 10
// //       );
// //       setPrevScrollPos(currentScrollPos);
// //     };

// //     window.addEventListener(
// //       "scroll",
// //       handleScroll
// //     );
// //     return () =>
// //       window.removeEventListener(
// //         "scroll",
// //         handleScroll
// //       );
// //   }, [prevScrollPos]);

// //   const toggleMenu = () => {
// //     setIsMenuOpen(!isMenuOpen);
// //   };

// //   return (
// //     <header
// //       className={`bg-white shadow fixed w-full z-50 transition-transform duration-300 ${
// //         visible
// //           ? "translate-y-0"
// //           : "-translate-y-full"
// //       }`}
// //     >
// //       <nav className="container mx-auto px-6 py-3">
// //         <div className="flex justify-between items-center">
// //           <div className="text-xl font-semibold text-gray-700">
// //             <Link href="/">ستارة مول</Link>
// //           </div>
// //           <div className="hidden md:flex space-x-4 items-center">
// //             <Link
// //               href="/gallery"
// //               className="text-gray-800 hover:text-gray-600 transition duration-300"
// //             >
// //               المعرض
// //             </Link>
// //             <Link
// //               href="/contact"
// //               className="text-gray-800 hover:text-gray-600 transition duration-300"
// //             >
// //               تواصل معنا
// //             </Link>
// //             <SignedIn>
// //               {isAuthorized(user) && (
// //                 <Link
// //                   href="/verify-passcode"
// //                   className="text-gray-800 hover:text-gray-600 transition duration-300"
// //                 >
// //                   Admin Access
// //                 </Link>
// //               )}
// //               <UserButton afterSignOutUrl="/" />
// //             </SignedIn>
// //             <SignedOut>
// //               <Link
// //                 href="/sign-in"
// //                 className="text-gray-800 hover:text-gray-600 transition duration-300"
// //               >
// //                 Sign In
// //               </Link>
// //             </SignedOut>
// //           </div>
// //           <div className="md:hidden">
// //             <button
// //               onClick={toggleMenu}
// //               className="text-gray-800"
// //             >
// //               <Menu size={24} />
// //             </button>
// //           </div>
// //         </div>
// //         {isMenuOpen && (
// //           <div className="md:hidden mt-4">
// //             <Link
// //               href="/gallery"
// //               className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
// //             >
// //               المعرض
// //             </Link>
// //             <Link
// //               href="/contact"
// //               className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
// //             >
// //               تواصل معنا
// //             </Link>
// //             <SignedIn>
// //               {orized(user) && (
// //                 <Link
// //                   href="/verify-passcode"
// //                   className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
// //                 >
// //                   Admin Access
// //                 </Link>
// //               )}
// //               <div className="py-2">
// //                 <UserButton afterSignOutUrl="/" />
// //               </div>
// //             </SignedIn>
// //             <SignedOut>
// //               <Link
// //                 href="/sign-in"
// //                 className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
// //               >
// //                 Sign In
// //               </Link>
// //             </SignedOut>
// //           </div>
// //         )}
// //       </nav>
// //     </header>
// //   );
// // }
