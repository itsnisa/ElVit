import { useRef, useState } from 'react'

interface UploadZoneProps {
  onFileSelected: (file: File) => void
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Hanya file PDF yang diterima. Silakan pilih file .pdf')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimum 10 MB.')
      return
    }
    onFileSelected(file)
  }

  return (
    <div
      className={`upload-zone${dragging ? ' dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer?.files?.[0])
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label="Upload CV PDF"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        id="cvFileInput"
        aria-label="Pilih file CV PDF"
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'none' }}
      />
      <div className="upload-icon">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3>Drag &amp; drop CV PDF</h3>
      <p>atau klik untuk pilih file</p>
      <div className="file-badge">PDF · Maks 10 MB</div>
    </div>
  )
}
