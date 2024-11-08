"use client";

import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import uniqid from "uniqid";
import useUploadModal from "@/hooks/useUploadModal";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";

const UploadModal = () => {

    const [isLoading, setIsLoading] = useState(false);
    const uploadModal = useUploadModal();
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();


    const removeVietnameseTones = (str: string) => {
        str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
        str = str.replace(/[^a-zA-Z0-9-_]/g, '-'); // Replace non-alphanumeric characters with hyphens
        return str;
      };

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues:{
            author: "",
            title: "",
            song: null,
            image: null,
        }
    })
    const onChange = (open: boolean) => {
        if(!open){
            uploadModal.onClose();
        }
    }
    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try{
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];

            if(!imageFile || !songFile || !user){
                toast.error('Bạn chưa nhập đủ các trường')
                return;
            }

            const uniqueID = uniqid();
            const sanitizedTitle = removeVietnameseTones(values.title);

            //uploads song
            const {
                data: songData,
                error: songError,
            } = await supabaseClient.storage
                .from('songs')
                .upload(`song-${sanitizedTitle}-${uniqueID}`, songFile, {
                    cacheControl: '3600',
                    upsert: false,
                })
                if(songError){
                    setIsLoading(false);
                    return toast.error('Tải lên bài hát thất bại')
                }
                       //uploads image
            const {
                data: imageData,
                error: imageError,
            } = await supabaseClient.storage
                .from('images')
                .upload(`image-${sanitizedTitle}-${uniqueID}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                })

                if(imageError){
                    setIsLoading(false);
                    return toast.error('Tải lên hình ảnh thất bại');
                }
                    const {
                        error: supabaseError
                    } = await supabaseClient
                    .from('songs')
                    .insert({
                        user_id: user.id,
                        title: values.title,
                        author: values.author,
                        image_path: imageData.path,
                        song_path: songData.path,
                    })

                    if(supabaseError){
                        setIsLoading(false);
                        return toast.error(supabaseError.message)
                    }
                    router.refresh();
                    setIsLoading(false);
                    toast.success('Đã tạo thành công bài hát')
                    reset()
                    uploadModal.onClose();
            }catch(error){
                toast.error("Có gì đó không đúng");
            }finally{
                setIsLoading(false);
            }

        
    }
    return (
        <Modal
            title="Thêm bài hát"
            description="Tải lên tệp mp3"
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >   
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
        >
            <Input 
                id="title"
                disabled={isLoading}
                {...register('title', {required: true})}
                placeholder="Song title"
            />
            <Input 
                id="author"
                disabled={isLoading}
                {...register('author', {required: true})}
                placeholder="Song author"
            />
                <div>
                    <div className="pb-1">
                    Chọn bài hát
                    </div>
                    <Input 
                    id="song"
                    type="file"
                    disabled={isLoading}
                    accept=".mp3"
                    {...register("song", {required: true})}
                    />
                </div>
                <div>
                    <div className="pb-1">
                    Chọn hình ảnh
                    </div>
                    <Input 
                    id="image"
                    type="file"
                    disabled={isLoading}
                    accept="image/*"
                    {...register("image", {required: true})}
                    />
                </div>
            <Button disabled={isLoading} type="submit">
                Thêm
            </Button>
        </form>
        </Modal>
    )
}

export default UploadModal;