"use client"

import { useState } from "react"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase/config"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  folder?: "properties" | "maintenance"
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 6,
  folder = "properties" 
}: ImageUploadProps) {
  const t = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      toast.error(t("messages.error"), {
        description: `Maximum ${maxImages} images allowed`,
      })
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    
    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(t("messages.error"), {
            description: `${file.name} is not an image file`,
          })
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(t("messages.error"), {
            description: `${file.name} is too large. Max size is 5MB`,
          })
          continue
        }

        // Create unique filename
        const timestamp = Date.now()
        const filename = `${folder}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
        const storageRef = ref(storage, filename)

        // Upload file
        const uploadTask = uploadBytesResumable(storageRef, file)

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(progress)
            },
            (error) => {
              console.error("Upload error:", error)
              reject(error)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                uploadedUrls.push(downloadURL)
                resolve()
              } catch (error) {
                reject(error)
              }
            }
          )
        })
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls])
        toast.success(t("messages.success"), {
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(t("messages.error"), {
        description: "Failed to upload images. Please try again.",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      e.target.value = ""
    }
  }

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Extract filename from URL to delete from Firebase Storage
      try {
        const decodedUrl = decodeURIComponent(imageUrl)
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/)
        if (pathMatch && pathMatch[1]) {
          const imagePath = pathMatch[1]
          const imageRef = ref(storage, imagePath)
          await deleteObject(imageRef)
        }
      } catch (deleteError) {
        // If deletion fails, still remove from UI
        console.warn("Could not delete from storage:", deleteError)
      }

      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      
      toast.success(t("messages.success"), {
        description: "Image removed successfully",
      })
    } catch (error) {
      console.error("Error removing image:", error)
      toast.error(t("messages.error"), {
        description: "Failed to remove image",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Images ({images.length}/{maxImages})
          </label>
          {images.length < maxImages && (
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            No images uploaded yet. Click the button above to upload images.
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxImages} images, up to 5MB each. Supported formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveImage(imageUrl, index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
