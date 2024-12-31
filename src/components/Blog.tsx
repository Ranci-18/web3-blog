import React, { useState } from "react";
import { deflate, inflate } from 'pako';
import '../sass/blog.sass';

const Blog: React.FC = () => {
    const [blog, setBlog] = useState<string>("");
    const [compressedBlog, setCompressedBlog] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleBlogChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBlog(e.target.value);
    }

    const compressBlog = async () => {
        setLoading(true);
        try {
            // Convert string to Uint8Array
            const textEncoder = new TextEncoder();
            const data = textEncoder.encode(blog);
            
            // Compress the data
            const compressed = deflate(data);
            
            // Convert to base64 using btoa
            const base64Compressed = btoa(
                String.fromCharCode(...Array.from(compressed))
            );
            
            console.log('Original size:', blog.length);
            console.log('Compressed size:', compressed.length);
            console.log('Base64 size:', base64Compressed.length);
            
            setCompressedBlog(base64Compressed);
        } catch (error) {
            console.error('Compression failed:', error);
        }
        setLoading(false);
    }

    const decompressBlog = async (compressedData: string) => {
        try {
            // Convert base64 back to Uint8Array
            const binaryString = atob(compressedData);
            const compressed = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                compressed[i] = binaryString.charCodeAt(i);
            }
            
            // Decompress
            const decompressed = inflate(compressed);
            
            // Convert back to string
            const textDecoder = new TextDecoder();
            return textDecoder.decode(decompressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            return '';
        }
    }

    return (
        <div className="blog">
            <label htmlFor="blog">
                <p>Write blog here!</p>
                <textarea
                    value={blog}
                    onChange={handleBlogChange}
                    placeholder="Write your blog here..."
                    id="blog"
                    cols={40}
                    rows={10}
                />
            </label>
            
            <button onClick={compressBlog} disabled={loading}>
                {loading ? "Loading..." : "Compress Blog"}
            </button>
            <div className="compressed">
                {compressedBlog && (
                    <>
                        <p>Compressed Blog (base64):</p>
                        <p className="compressed-content">{compressedBlog}</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default Blog;