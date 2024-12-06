import { FilePreview as FilePreviewInterface } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "../ui/button";

export const FilePreview = ({ isUploading, files, onRemoveFiles }: { isUploading: boolean; files: FilePreviewInterface[], onRemoveFiles: () => void }) => {
    if (files.length === 0) return null;

    return (
        <div className="flex space-between items-center bg-muted pl-4 pr-2 py-2">
            <div className="flex-1">
                {files.map((file) => (
                    <img
                        loading="lazy"
                        key={crypto.randomUUID()}
                        className="flex-1 w-12 h-12 object-cover rounded"
                        src={file.src as string}
                        alt={file.name}
                    />
                ))}
            </div>
            {!isUploading && (
                <Button
                    className="w-6 h-6 p-0 rounded-full"
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={onRemoveFiles}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};
