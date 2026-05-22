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
type SelectedDocument = {
  id: string
  file: File
  previewUrl: string | null
  analysis: DocumentAnalysis
}

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

function baseNameFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/\s+/g, "_")
}

function createSelectedDocument(file: File, index: number): SelectedDocument {
  return {
    id: `${Date.now()}_${index}_${file.name}`,
    file,
    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    analysis: { ...defaultAnalysis(), suggested_filename: baseNameFromFile(file) },
  }
}

function revokePreviewUrls(documents: SelectedDocument[]) {
  documents.forEach((doc) => {
    if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl)
  })
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
  const [documents, setDocuments] = useState<SelectedDocument[]>([])
  const [uploadStep, setUploadStep] = useState(0)
  const [uploadLabel, setUploadLabel] = useState("")
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
    revokePreviewUrls(documents)
    setState("options")
    setDocuments([])
    setUploadStep(0)
    setUploadLabel("")
    setErrorMsg("")
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const picked = Array.from(files).filter((file) =>
      file.type.startsWith("image/") || file.type === "application/pdf"
    )

    if (picked.length === 0) {
      setErrorMsg("Bitte Bilder oder PDF-Dateien auswählen.")
      setState("error")
      return
    }

    const nextDocuments = picked.map((file, index) => createSelectedDocument(file, index))
    revokePreviewUrls(documents)
    setDocuments(nextDocuments)
    setState("preview")
  }

  async function handleUpload() {
    if (documents.length === 0) return
    setState("uploading")
    setUploadStep(0)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      for (const [index, doc] of documents.entries()) {
        const current = `${index + 1}/${documents.length}: ${doc.file.name}`

        setUploadLabel(current)
        setUploadStep(1)
        let pdfBytes: Uint8Array
        if (doc.file.type === "application/pdf") {
          pdfBytes = new Uint8Array(await doc.file.arrayBuffer())
        } else {
          pdfBytes = await convertImageToPdf(doc.file)
        }

        setUploadStep(2)
        const safeName = (doc.analysis.suggested_filename || doc.analysis.doc_type)
          .toLowerCase().replace(/[^a-z0-9_\-]/g, "_")
        const filename = `${safeName}_${Date.now()}_${index}.pdf`
        const category = doc.analysis.category ?? "sonstiges"
        const storagePath = `${user.id}/${category}/${filename}`

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: false })

        if (uploadError) throw new Error(uploadError.message)

        const result = await saveDocument({
          filePath: storagePath,
          originalFilename: doc.file.name,
          suggestedFilename: safeName,
          fileSize: pdfBytes.byteLength,
          analysis: doc.analysis,
          analysisRaw: "",
        })

        if (result.error) throw new Error(result.error)
      }

      setUploadStep(3)
      setUploadLabel(`${documents.length} Dokument${documents.length === 1 ? "" : "e"} gespeichert`)
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
          <input ref={cloudRef} type="file" accept="image/*,application/pdf" multiple
            className="sr-only" onChange={(e) => handleFiles(e.target.files)} />

          {state === "options" && (
            <div className="space-y-2">
              {[
                { icon: Camera, label: "Kamera", sub: "Direkt fotografieren",
                  onClick: () => { if ("vibrate" in navigator) navigator.vibrate(10); cameraRef.current?.click() },
                  color: "text-blue-500 bg-blue-50" },
                { icon: Images, label: "PC / Galerie", sub: "Mehrere Fotos oder PDFs",
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
                <p className="text-xs font-semibold text-muted-foreground">Mehrere Bilder oder PDFs hierher ziehen</p>
              </div>
            </div>
          )}

          {state === "preview" && documents.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={doc.id} className="space-y-2">
                    {documents.length > 1 && (
                      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                        Dokument {index + 1} von {documents.length}
                      </p>
                    )}
                    <FilePreviewCard
                      file={doc.file}
                      previewUrl={doc.previewUrl}
                      analysis={doc.analysis}
                      onChange={(updates) => setDocuments((prev) => prev.map((item) =>
                        item.id === doc.id
                          ? { ...item, analysis: { ...item.analysis, ...updates } }
                          : item
                      ))}
                    />
                  </div>
                ))}
              </div>
              <Button size="touch" className="w-full gap-2" onClick={handleUpload}>
                <Upload className="size-4" />
                {documents.length === 1 ? "Hochladen" : `${documents.length} Dokumente hochladen`}
              </Button>
            </div>
          )}

          {state === "uploading" && <UploadProgress step={uploadStep} detail={uploadLabel} />}
          {state === "done" && <UploadProgress step={3} detail={uploadLabel} />}

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
