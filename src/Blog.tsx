import { createHash } from "crypto";
import React, { useState } from "react";

const Blog: React.FC = () => {
    const [blog, setBlog] = useState<string>("");
    const [hash, setHash] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleBlogChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBlog(e.target.value);
    }

    const generateHash = async () => {
        setLoading(true);
        const hash = createHash("sha256").update(blog).digest("hex");
        setHash(hash);
        setLoading(false);
    }

    return (
        <div>
            <h1>Blog</h1>
            <textarea
                value={blog}
                onChange={handleBlogChange}
                placeholder="Write your blog here..."
            />
            <button onClick={generateHash} disabled={loading}>
                {loading ? "Loading..." : "Hash Blog"}
            </button>
            {hash && <p>Hash: {hash}</p>}
        </div>
    );
}

export default Blog;