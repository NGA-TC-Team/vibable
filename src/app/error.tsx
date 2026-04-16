"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 py-16 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <Image
          src="/error.png"
          alt="오류 발생"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 512px) 100vw, 512px"
          className="h-auto w-full max-w-md select-none"
        />

        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-purple-300 sm:text-2xl">
            앗! 문제가 발생했어요
          </h1>
          <p className="text-sm leading-relaxed text-purple-200/55 sm:text-base">
            일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-purple-400/40 bg-transparent text-purple-200 hover:border-purple-300/60 hover:bg-purple-400/10 hover:text-purple-100"
            onClick={() => unstable_retry()}
          >
            다시 시도하기
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-purple-400/40 bg-transparent text-purple-200 hover:border-purple-300/60 hover:bg-purple-400/10 hover:text-purple-100"
          >
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
