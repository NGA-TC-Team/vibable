import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없음",
  description:
    "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <Image
          src="/not-found.png"
          alt="404 — 페이지를 찾을 수 없음"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 512px) 100vw, 512px"
          className="h-auto w-full max-w-md select-none"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-sky-700 sm:text-2xl">
            길을 잃었나봐요
          </h1>
          <p className="text-sm leading-relaxed text-sky-500/70 sm:text-base">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-sky-400/40 bg-transparent text-sky-700 hover:border-sky-300/60 hover:bg-sky-400/10 hover:text-sky-800"
        >
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </main>
  );
}
