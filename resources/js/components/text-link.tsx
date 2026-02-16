import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link
            className={cn(
                'text-amber-900 underline decoration-amber-300 underline-offset-4 transition-colors duration-300 ease-out hover:text-amber-700 hover:decoration-current! dark:text-amber-400 dark:decoration-amber-500 dark:hover:text-amber-300',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
