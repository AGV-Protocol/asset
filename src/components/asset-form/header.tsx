"use client";

import Image from "next/image";

export function AssetFormHeader() {
  return (
    <header className="flex items-center space-x-4 mb-8">
      <Image
        src="/logo.png"
        alt="AGV Protocol"
        width={40}
        height={40}
        className="rounded-lg"
      />
      <h1 className="!text-lg font-bold text-white">REAL WORLD ASSETS</h1>
    </header>
  );
}
