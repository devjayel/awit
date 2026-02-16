import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome to Awit">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=dm-serif-display:400|inter:300,400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-6">
                <main className="w-full max-w-4xl text-center">
                    {/* Logo and Title */}
                    <div className="mb-12 flex flex-col items-center gap-4">
                        <AppLogoIcon className="h-20 w-20 fill-current text-amber-700" />
                        <h1 className="text-6xl font-semibold tracking-tight text-amber-900 sm:text-7xl" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            Awit
                        </h1>
                    </div>

                    {/* Bible Verse */}
                    <div className="mb-16">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-700">
                            Awit 92:1
                        </p>
                        <blockquote className="text-2xl font-light leading-relaxed text-gray-800 sm:text-3xl lg:text-4xl">
                            "Isang mabuting bagay ang magpapasalamat sa Panginoon, at umawit ng mga pagpuri sa iyong pangalan, Oh Kataastaasan:"
                        </blockquote>
                    </div>

                    {/* CTA Button */}
                    <div>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-full bg-amber-700 px-12 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-amber-800 hover:shadow-xl"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-block rounded-full bg-amber-700 px-12 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-amber-800 hover:shadow-xl"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Musical Note Decoration */}
                    <div className="mt-20 flex justify-center gap-8 opacity-20">
                        <svg className="h-10 w-10 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <svg className="h-14 w-14 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <svg className="h-10 w-10 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                </main>
            </div>
        </>
    );
}
