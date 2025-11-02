// Add this hook at the top of your component
const { edgestore } = useEdgeStore();

// Updated upload function using EdgeStore client
const uploadFilesToEdgeStore = async (files: File[]): Promise<string[]> => {
    setUploadProgress({
        isUploading: true,
        progress: 0,
        currentFile: "",
        totalFiles: files.length,
        currentFileIndex: 0
    });

    const uploadPromises = files.map(async (file, index) => {
        try {
            setUploadProgress(prev => ({
                ...prev,
                currentFile: file.name,
                currentFileIndex: index + 1,
                progress: (index / files.length) * 100
            }));

            // Upload directly to EdgeStore
            const res = await edgestore.publicFiles.upload({
                file,
                onProgressChange: (progress) => {
                    console.log(`Upload progress for ${file.name}: ${progress}%`);
                },
            });

            setUploadProgress(prev => ({
                ...prev,
                progress: ((index + 1) / files.length) * 100
            }));

            return res.url;
        } catch (error) {
            console.error(" Error uploading file to EdgeStore:", error);
            throw error;
        }
    });

    const results = await Promise.all(uploadPromises);

    setUploadProgress({
        isUploading: false,
        progress: 100,
        currentFile: "",
        totalFiles: 0,
        currentFileIndex: 0
    });

    return results;
};