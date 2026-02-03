"use client";

import Lottie from "lottie-react";
import animationData from "@/app/assets/lottie/Lonely-404.json";


export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="w-100 h-auto"
      />

      <h1 className="mt-6 text-3xl font-bold">
         Page Not Found
      </h1>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
