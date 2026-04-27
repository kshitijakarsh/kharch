"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function V2LandingPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("/code");
        toast.success("Copied to clipboard");
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "Enter" && otp.join("").length === 6) {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        const code = otp.join("");
        if (code.length < 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Welcome back!");
                window.location.href = "/";
            } else {
                toast.error(data.error || "Invalid code");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

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
                        {otp.map((value, index) => (
                            <div key={index} className="relative bg-white h-[60px] w-[50px] rounded-lg ring ring-white/5 ring-offset-2 ring-offset-black overflow-hidden transition-all focus-within:ring-white/30">
                                <div className="absolute inset-0.5 border border-dashed border-black/10 rounded-[inherit] pointer-events-none"></div>
                                <input
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-full h-full bg-transparent text-center text-xl font-bold text-black outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="bg-white w-[110px] h-[44px] mt-6 rounded-lg flex items-center justify-center text-black font-semibold text-sm hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Let's go"}
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