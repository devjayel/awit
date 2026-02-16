import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { FileText, Shield, Database } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Terms of Service',
        href: '/tos',
    },
];

export default function TermsOfService() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Terms of Service" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-6">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                        <p className="text-muted-foreground">
                            Please read these terms carefully before using this application.
                        </p>
                    </div>

                    <div className="space-y-6 rounded-lg border bg-card p-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Shield className="mt-1 h-5 w-5 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Data Privacy</h2>
                                    <p className="text-muted-foreground">
                                        This application respects your privacy. All data stored and processed 
                                        within this application is handled with care and in accordance with 
                                        applicable data protection regulations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Database className="mt-1 h-5 w-5 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Content Source</h2>
                                    <p className="text-muted-foreground">
                                        All music, videos, and PDF files available in this application are 
                                        from the <strong>MCGI Music Department</strong>. These materials are 
                                        provided for educational and personal use.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="mt-1 h-5 w-5 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Purpose of This Application</h2>
                                    <p className="text-muted-foreground">
                                        This website was created for personal use to access MCGI Music Department 
                                        files in an easy and convenient way. The application provides a streamlined 
                                        interface for browsing, searching, and playing media content.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Shield className="mt-1 h-5 w-5 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Usage Terms</h2>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p>By using this application, you agree to:</p>
                                        <ul className="ml-6 list-disc space-y-1">
                                            <li>Use the content for personal, non-commercial purposes only</li>
                                            <li>Respect the intellectual property rights of the MCGI Music Department</li>
                                            <li>Not redistribute or share the content without proper authorization</li>
                                            <li>Use the application responsibly and in accordance with applicable laws</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="mt-1 h-5 w-5 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Disclaimer</h2>
                                    <p className="text-muted-foreground">
                                        This application is provided "as is" without warranty of any kind. 
                                        The developer makes no representations or warranties regarding the 
                                        accuracy, completeness, or reliability of the content or the application itself.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                Last updated: {new Date().toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
