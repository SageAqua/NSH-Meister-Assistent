"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Camera, Images, Cloud, X, ChevronRight, Upload, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { convertImageToPdf } from "@/lib/documents/convertImageToPdf"
import { saveDocument } from "@/app/actions/documents"
import { FilePreviewCard } from "./FilePreviewCard"
import { UploadProgress } from "./UploadProgress"
import { createClient } from "@/lib/supabase/client"
import type { DocumentAnalysis } from "@/types"

type SheetState = "options" | "preview" | "uploading" | "done" | "error"

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

function defaultAnalysis(): DocumentAnalysis {
  return {
    doc_type: "sonstiges",
    doc_direction: "ausgabe",
    category: "sonstiges",
    vendor: null,
    recipient: null,
    amount_gross: null,
    amount_net: null,
    amount_vat: null,
    vat_rate: 19,
    document_date: todayStr(),
    document_number: null,
    suggested_filename: "",
  }
}

interface Props {
  open: boolean
  onClose: () => void
}

export function DocumentScannerSheet({ open, onClose }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const cloudRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<SheetState>("options")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DocumentAnalysis>(defaultAnalysis())
  const [uploadStep, setUploadStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  function handleClose() {
    onClose()
    setTimeout(reset, 300)
  }

  function reset() {
    setState("options")
    setFile(null)
    setPreviewUrl(null)
    setAnalysis(defaultAnalysis())
    setUploadStep(0)
    setErrorMsg("")
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const picked = files[0]
    setFile(picked)
    setPreviewUrl(picked.type.startsWith("image/") ? URL.createObjectURL(picked) : null)
    // Pre-fill suggested filename with original name (without extension)
    const baseName = picked.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/\s+/g, "_")
    setAnalysis({ ...defaultAnalysis(), suggested_filename: baseName })
    setState("preview")
  }

  async function handleUpload() {
    if (!file) return
    setState("uploading")
    setUploadStep(0)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      setUploadStep(1)
      let pdfBytes: Uint8Array
      if (file.type === "application/pdf") {
        pdfBytes = new Uint8Array(await file.arrayBuffer())
      } else {
        pdfBytes = await convertImageToPdf(file)
      }

      setUploadStep(2)
      const safeName = (analysis.suggested_filename || analysis.doc_type)
        .toLowerCase().replace(/[^a-z0-9_\-]/g, "_")
      const filename = `${safeName}_${Date.now()}.pdf`
      const category = analysis.category ?? "sonstiges"
      const storagePath = `${user.id}/${category}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const result = await saveDocument({
        filePath: storagePath,
        originalFilename: file.name,
        suggestedFilename: safeName,
        fileSize: pdfBytes.byteLength,
        analysis,
        analysisRaw: "",
      })

      if (result.error) throw new Error(result.error)

      setUploadStep(3)
      setState("done")
      setTimeout(handleClose, 1800)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload fehlgeschlagen")
      setState("error")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:flex md:items-center md:justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-2xl border border-border bg-card shadow-2xl md:relative md:inset-auto md:w-full md:max-w-lg md:rounded-2xl">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <div className="flex items-center gap-3">
            {(state === "preview" || state === "error") && (
              <button type="button" onClick={reset}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-accent">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-black text-foreground">Dokument scannen</h2>
              <p className="text-xs text-muted-foreground">
                {state === "options" && "Foto, Galerie oder Cloud"}
                {state === "preview" && "Angaben prüfen & hochladen"}
                {state === "uploading" && "Wird verarbeitet..."}
                {state === "done" && "Erfolgreich gespeichert!"}
                {state === "error" && "Fehler aufgetreten"}
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-accent" aria-label="Schließen">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">

          {/* Hidden inputs */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
          <input ref={galleryRef} type="file" accept="image/*,application/pdf" multiple
            className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
          <input ref={cloudRef} type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" multiple
            className="sr-only" onChange={(e) => handleFiles(e.target.files)} />

          {state === "options" && (
            <div className="space-y-2">
              {[
                { icon: Camera, label: "Kamera", sub: "Direkt fotografieren",
                  onClick: () => { if ("vibrate" in navigator) navigator.vibrate(10); cameraRef.current?.click() },
                  color: "text-blue-500 bg-blue-50" },
                { icon: Images, label: "Galerie & Dateien", sub: "Fotos, PDFs, Dokumente",
                  onClick: () => galleryRef.current?.click(),
                  color: "text-violet-500 bg-violet-50" },
                { icon: Cloud, label: "Cloud-Dokumente", sub: "iCloud, Google Drive, Dropbox",
                  onClick: () => cloudRef.current?.click(),
                  color: "text-sky-500 bg-sky-50" },
              ].map(({ icon: Icon, label, sub, onClick, color }) => (
                <button key={label} type="button" onClick={onClick}
                  className="flex w-full min-h-[72px] items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted active:scale-[0.98]">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}

              {/* Desktop drag zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`hidden md:flex mt-3 h-20 items-center justify-center rounded-xl border border-dashed transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <p className="text-xs font-semibold text-muted-foreground">Oder hierher ziehen</p>
              </div>
            </div>
          )}

          {state === "preview" && file && (
            <div className="space-y-4">
              <FilePreviewCard
                file={file}
                previewUrl={previewUrl}
                analysis={analysis}
                onChange={(updates) => setAnalysis((prev) => ({ ...prev, ...updates }))}
              />
              <Button size="touch" className="w-full gap-2" onClick={handleUpload}>
                <Upload className="size-4" />
                Hochladen
              </Button>
            </div>
          )}

          {state === "uploading" && <UploadProgress step={uploadStep} />}
          {state === "done" && <UploadProgress step={3} />}

          {state === "error" && (
            <div className="space-y-4 py-6 text-center">
              <p className="text-sm font-semibold text-destructive">{errorMsg}</p>
              <Button variant="outline" onClick={reset} className="w-full">Erneut versuchen</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
