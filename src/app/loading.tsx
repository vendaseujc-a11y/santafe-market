export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-sertão-200 border-t-sertão-600 rounded-full animate-spin mb-4" />
        <p className="text-sertão-600 font-semibold">Carregando...</p>
      </div>
    </div>
  )
}