"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, Loader2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function NewCoursePage() {
    const supabase = createClient();
    const router = useRouter();

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instructor, setInstructor] = useState("");
    const [duration, setDuration] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";

            // 1. Upload Image if selected
            if (imageFile) {
                const uploadResult = await uploadToCloudinary(imageFile);
                if (uploadResult?.secure_url) {
                    imageUrl = uploadResult.secure_url;
                }
            }

            // 2. Get current admin user
            const { data: { user } } = await supabase.auth.getUser();

            // 3. Insert into Supabase
            const { error } = await supabase.from('courses').insert({
                title,
                description,
                instructor_name: instructor,
                duration,
                image_url: imageUrl,
                created_by: user?.id,
                is_published: true // Auto publish for testing
            });

            if (error) throw error;

            router.push('/admin/courses');
            router.refresh();

        } catch (error) {
            alert("Error creating course: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Course</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                    <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                        placeholder="e.g. Advanced AI Masterclass"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                        placeholder="What will students learn?"
                    />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Instructor Name</label>
                        <input
                            required
                            value={instructor}
                            onChange={e => setInstructor(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="Dr. Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                        <input
                            required
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="4 Weeks"
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setImageFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-500 font-medium">
                            {imageFile ? <span className="text-blue-600">{imageFile.name}</span> : "Click to upload image"}
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Publish Course</>}
                </button>

            </form>
        </div>
    );
}
