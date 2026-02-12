'use client'; 
 
 import { useState, useRef } from 'react'; 
 import { Button } from "@heroui/react"; 
 import { ImageIcon, ZoomIn } from "lucide-react"; 
 import Cropper from 'react-easy-crop'; 
 import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Slider 
} from "@heroui/react"; 
import { useToast } from "@/hooks/use-toast"; 
import { getCroppedImg } from "@/lib/image-crop"; 

interface CoverUploaderProps { 
  currentImageUrl?: string | null; 
  onUpload: (file: File) => Promise<void>; 
  isUploading?: boolean; 
} 

const MAX_FILE_SIZE_MB = 2; 

export function CoverUploader({ currentImageUrl, onUpload, isUploading }: CoverUploaderProps) { 
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string | null>(null); 
   const [fileName, setFileName] = useState(""); 
   const [crop, setCrop] = useState({ x: 0, y: 0 }); 
   const [zoom, setZoom] = useState(1); 
   const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null); 
   
   const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure(); 
   const fileInputRef = useRef<HTMLInputElement>(null); 
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { 
     if (e.target.files?.[0]) { 
       const file = e.target.files[0]; 
       if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { 
         showToast(`Max ${MAX_FILE_SIZE_MB}MB allowed`, "error");
         return; 
       } 
       const reader = new FileReader(); 
       reader.onload = () => { 
         setSelectedFile(reader.result as string); 
         setFileName(file.name); 
         setZoom(1); 
         onOpen(); 
       }; 
       reader.readAsDataURL(file); 
     } 
   }; 
 
   const handleSave = async () => { 
     try { 
       if (!selectedFile || !croppedAreaPixels) return; 
       
       const blob = await getCroppedImg(selectedFile, croppedAreaPixels); 
       const file = new File([blob], fileName, { type: "image/jpeg" }); 
       
       await onUpload(file); 
       onClose(); 
     } catch (err) { 
       console.error(err); 
       showToast("Failed to crop image", "error");
     } 
   }; 
 
   return ( 
     <div 
       className="group relative w-full h-48 md:h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer" 
       onClick={() => fileInputRef.current?.click()} 
     > 
       {currentImageUrl ? ( 
          <> 
            <img src={currentImageUrl} className="w-full h-full object-cover" alt="Cover" /> 
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"> 
              <Button className="pointer-events-none text-white" variant="flat">Change Cover</Button> 
            </div> 
          </> 
       ) : ( 
         <div className="flex flex-col items-center justify-center h-full text-gray-500"> 
           <ImageIcon className="mb-2 w-8 h-8" /> 
           <span className="text-sm font-medium">Upload Cover</span> 
           <span className="text-xs mt-1">Max {MAX_FILE_SIZE_MB}MB</span> 
         </div> 
       )} 
       
       <input 
         type="file" 
         ref={fileInputRef} 
         className="hidden" 
         accept="image/*" 
         onChange={handleFileSelect} 
       /> 
       
       <Modal 
         isOpen={isOpen} 
         onOpenChange={onOpenChange} 
         size="2xl" 
         isDismissable={false} 
         hideCloseButton={isUploading} 
       > 
         <ModalContent> 
           {(onClose) => ( 
             <> 
               <ModalHeader>Adjust Cover Image</ModalHeader> 
              <ModalBody className="max-h-[80vh] overflow-y-auto"> 
                <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden"> 
                   {selectedFile && ( 
                     <Cropper 
                       image={selectedFile} 
                       crop={crop} 
                       zoom={zoom} 
                       aspect={3/1} 
                       onCropChange={setCrop} 
                       onZoomChange={setZoom} 
                       onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} 
                     /> 
                   )} 
                 </div> 
                 
                 <div className="flex items-center gap-4 mt-4 px-2"> 
                   <ZoomIn className="w-5 h-5 text-gray-500" /> 
                   <Slider 
                     aria-label="Zoom" 
                     step={0.1} 
                     minValue={1} 
                     maxValue={3} 
                     value={zoom} 
                     onChange={(v) => setZoom(v as number)} 
                     className="flex-1" 
                   /> 
                 </div> 
               </ModalBody> 
               <ModalFooter> 
                 <Button variant="light" onPress={onClose} isDisabled={isUploading}> 
                   Cancel 
                 </Button> 
                 <Button color="primary" onPress={handleSave} isLoading={isUploading}>
                   Save Cover
                 </Button>
               </ModalFooter> 
             </> 
           )} 
         </ModalContent> 
       </Modal> 
     </div> 
   ); 
 }