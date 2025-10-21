import { AlertTriangle } from "lucide-react"

interface ErrorComponentProps {
  message: string,
}

export default function ErrorComponent({ message }: ErrorComponentProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-700 text-lg font-medium max-w-md">{message}</p>
    </div>
  )
}
