"use client";

import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import React from "react";

interface PageContentProps {
    songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({
    songs
}) => {
    const onPlay = useOnPlay(songs);

    if(songs.length === 0){
        return (
            <div className="mt-4 text-neutral-400">
                No songs
            </div>
        )
    }
    return (
        <div
        className="
            grid
            grid-cols-2
            s:gap-2
            sm:grid-cols-3
            md:grid-cols-3
            lg:grid-cols-4
            2xl:grid-cols-6
            gap-4
            mt-4
        "
        >
        {songs.map((item) => (
            <SongItem 
                key={item.id}
                onClick={(id: string) => onPlay(id)}
                data={item}
            />
        ))}
        </div>
    )
}

export default PageContent;