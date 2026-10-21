"use client";

import Image from "next/image";

export default function TigerDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. TOP RIGHT CORNER: HANGING BRANCH */}
      <div className="absolute top-0 right-0 w-24 sm:w-30 opacity-85 z-0">
        <Image
          src="/leaf_corner_top_right.png"
          alt="Top right foliage"
          width={150}
          height={101}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* 2. BACKGROUND MISTY TREES BEHIND RATINGS */}
      <div className="absolute top-2 left-2 sm:left-4 w-24 sm:w-30 opacity-20 z-0">
        <Image
          src="/bg_tree_left_clean.png"
          alt="Background tree left"
          width={141}
          height={135}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="absolute top-2 right-4 sm:right-6 w-24 sm:w-30 opacity-20 z-0">
        <Image
          src="/bg_tree_right_clean.png"
          alt="Background tree right"
          width={126}
          height={142}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 3. LEFT MARGIN: DELICATE LEAVES */}
      <div className="absolute top-[95px] sm:top-[105px] left-1.5 sm:left-3 w-8 sm:w-11 opacity-75 z-0">
        <Image
          src="/leaf_04.png"
          alt="Left leaf sprig"
          width={86}
          height={100}
          className="w-full h-auto object-contain -rotate-6"
        />
      </div>

      <div className="absolute top-[340px] sm:top-[360px] left-1.5 sm:left-3 w-7 sm:w-9 opacity-80 z-0">
        <Image
          src="/leaf_03.png"
          alt="Inward leaf beside issues"
          width={66}
          height={89}
          className="w-full h-auto object-contain rotate-12"
        />
      </div>

      {/* 4. RIGHT MARGIN: CASCADING PAWS & LEAVES */}
      <div className="absolute top-[55px] sm:top-[65px] right-4 sm:right-7 w-8 sm:w-11 opacity-70 z-0">
        <Image
          src="/paw_trail.png"
          alt="Tiger paw trail"
          width={91}
          height={130}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="absolute top-[330px] sm:top-[350px] right-4 sm:right-6 w-8 sm:w-11 opacity-70 z-0">
        <Image
          src="/right_side_decor_clean.png"
          alt="Paw and leaf decor beside issues"
          width={77}
          height={161}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="absolute top-[485px] sm:top-[505px] right-5 sm:right-8 w-8 sm:w-10 opacity-85 z-0">
        <Image
          src="/paw_big.png"
          alt="Tiger pugmark beside comments"
          width={56}
          height={68}
          className="w-full h-auto object-contain rotate-12"
        />
      </div>

      {/* 5. BOTTOM VEGETATION BED */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-34 z-0 pointer-events-none flex items-end justify-between overflow-hidden">
        <div className="w-[38%] max-w-[200px] sm:max-w-[230px] flex-shrink-0 -ml-2 sm:-ml-1">
          <Image
            src="/bush_bottom_left.png"
            alt="Bottom bush left"
            width={286}
            height={144}
            className="w-full h-auto object-contain object-bottom"
            priority
          />
        </div>

        <div className="flex-1 max-w-[340px] sm:max-w-[420px] -mx-4 sm:-mx-6 mb-0">
          <Image
            src="/bush_bottom_center.png"
            alt="Bottom bush center"
            width={369}
            height={83}
            className="w-full h-auto object-contain object-bottom"
            priority
          />
        </div>

        <div className="w-[38%] max-w-[200px] sm:max-w-[230px] flex-shrink-0 -mr-2 sm:-mr-1">
          <Image
            src="/bush_bottom_right.png"
            alt="Bottom bush right"
            width={314}
            height={144}
            className="w-full h-auto object-contain object-bottom"
            priority
          />
        </div>
      </div>
    </div>
  );
}
