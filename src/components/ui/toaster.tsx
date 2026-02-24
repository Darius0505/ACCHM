"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }: any) {
                const Icon = props.variant === 'success' ? CheckCircle2 :
                    props.variant === 'destructive' ? AlertCircle : Info;

                const iconClass = props.variant === 'success' ? 'text-green-600' :
                    props.variant === 'destructive' ? 'text-red-600' : 'text-blue-500';

                return (
                    <Toast key={id} {...props}>
                        <div className="flex gap-4">
                            <Icon className={`w-6 h-6 mt-0.5 shrink-0 ${iconClass}`} />
                            <div className="grid gap-1">
                                {title && <ToastTitle>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription>{description}</ToastDescription>
                                )}
                            </div>
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
