"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Save } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HospitalSettingsProps {
  onSettingsChange: (settings: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }) => void
  settings: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }
}

export function HospitalSettings({ onSettingsChange, settings }: HospitalSettingsProps) {
  const [hospitalName, setHospitalName] = useState(settings.name || "")
  const [qualification, setQualification] = useState(settings.qualification || "")
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "/placeholder.svg?height=60&width=60")
  const [headerStyle, setHeaderStyle] = useState<"standard" | "modern" | "classic">(settings.headerStyle || "modern")
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || "#0ea5e9")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate file upload with a local URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setLogoUrl(result)
      setIsUploading(false)
    }

    reader.onerror = () => {
      console.error("Error reading file")
      setIsUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const saveSettings = () => {
    onSettingsChange({
      name: hospitalName,
      qualification,
      logoUrl,
      headerStyle,
      primaryColor,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Provider Details</TabsTrigger>
            <TabsTrigger value="style">Style Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Dr. Martin Jameson"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification/Title</Label>
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="QUALIFICATION"
              />
            </div>

            <div className="space-y-2">
              <Label>Medical Logo</Label>
              <div className="flex items-center gap-4">
                <div className="border rounded-md p-4 bg-muted/20 w-[80px] h-[80px] flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl || "/placeholder.svg"}
                      alt="Medical Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No logo</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mb-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="header-style">Header Style</Label>
              <Select
                value={headerStyle}
                onValueChange={(value: "standard" | "modern" | "classic") => setHeaderStyle(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select header style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="modern">Modern (Dr. Martin Style)</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#0ea5e9"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="border rounded-md p-4">
                {headerStyle === "modern" && (
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 style={{ color: primaryColor }} className="text-xl font-medium">
                        {hospitalName || "Dr. Martin Jameson"}
                      </h2>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {qualification || "QUALIFICATION"}
                      </p>
                    </div>
                    {logoUrl && (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Medical Logo"
                        className="h-12 w-12 object-contain"
                        style={{
                          filter: `brightness(0) saturate(100%) hue-rotate(0deg) sepia(0%) saturate(0%) brightness(100%) invert(0%) sepia(100%) saturate(5000%) hue-rotate(${primaryColor === "#0ea5e9" ? "190deg" : "0deg"})`,
                        }}
                      />
                    )}
                  </div>
                )}

                {headerStyle === "standard" && (
                  <div className="flex items-center gap-4">
                    {logoUrl && (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Medical Logo"
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
                        {hospitalName || "Medical Center"}
                      </h2>
                      <p className="text-sm text-muted-foreground">{qualification || "Healthcare Services"}</p>
                    </div>
                  </div>
                )}

                {headerStyle === "classic" && (
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {hospitalName || "Medical Center"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{qualification || "Healthcare Services"}</p>
                    {logoUrl && (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Medical Logo"
                        className="h-12 w-12 object-contain mx-auto mt-2"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={saveSettings} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Branding Settings
        </Button>
      </CardContent>
    </Card>
  )
}
