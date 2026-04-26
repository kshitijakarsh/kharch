"use client";

import { Copy } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function V2LandingPage() {

    const handleCopy = () => {
        navigator.clipboard.writeText("/code");
        toast.success("Copied to clipboard");
    }

    return (
        <div className="w-screen h-screen overflow-hidden grid grid-cols-2 bg-black">
            <div className="flex items-center justify-center py-10">
                <Image
                    src="/landing_page.png"
                    alt="Background"
                    width={390}
                    height={390}
                    className="rounded-3xl shadow-2xl"
                />
            </div>

            <div className="relative flex flex-col justify-center px-16">
                <div className="relative z-10 max-w-sm">
                    <h1 className="font-sans text-7xl font-bold text-white tracking-tighter selection:text-black selection:bg-white">Kharch</h1>
                    <p className="font-sans text-xl text-white/50 tracking-tighter mt-1 selection:text-black selection:bg-white">Financial clarity, recorded with poise.</p>

                    <div className="flex mt-12 gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="relative bg-white h-[60px] w-[50px] rounded-lg ring ring-white/5 ring-offset-2 ring-offset-black overflow-hidden transition-all focus-within:ring-white/30">
                                <div className="absolute inset-0.5 border border-dashed border-black/10 rounded-[inherit] pointer-events-none"></div>
                                <input
                                    type="text"
                                    maxLength={1}
                                    className="w-full h-full bg-transparent text-center text-xl font-bold text-black outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    {/* https://sqkhor.medium.com/create-an-otp-input-with-javascript-c0c9f7c610fe read and implement this */}

                    <button className="bg-white w-[110px] h-[44px] mt-6 rounded-lg flex items-center justify-center text-black font-semibold text-sm hover:bg-neutral-200 transition-all active:scale-95">
                        Let's go
                    </button>

                    <div className="flex flex-col gap-2 mt-12">
                        <div 
                            className="bg-neutral-900 border border-white/5 rounded-xl p-3.5 flex justify-between items-center w-full cursor-pointer group hover:border-white/10 transition-all"
                            onClick={handleCopy}
                        >
                            <h1 className="text-white font-mono text-base group-hover:text-white/80 transition-colors">/code</h1>
                            <Copy className="text-white w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-white/30 text-sm leading-3.5 selection:text-black selection:bg-white">Paste this message in our Telegram bot to get your login code.</p>
                    </div>
                </div>

                <div className="absolute top-0 right-0 h-full pointer-events-none">
                    <Image
                        src="/landing_s.svg"
                        alt="landing-svg"
                        width={600}
                        height={800}
                        className="h-full w-auto object-right object-contain"
                    />
                </div>
            </div>
        </div>
    );
}