export default function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span className="text-warning" title={`${value.toFixed(1)} / 5`}>
      {'★'.repeat(full)}
      <span className="text-secondary opacity-50">{'★'.repeat(5 - full)}</span>
    </span>
  )
}
