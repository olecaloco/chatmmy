import Fancybox from "@/components/fancybox";
import { fetchMedia } from "@/lib/api";
import { Media } from "@/models";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/gallery")({
    beforeLoad: ({ context, location }) => {
        if (!context.user.user) {
            throw redirect({
                to: "/signin",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const [gallery, setGallery] = useState<Media[]>([]);

    useEffect(() => {
        const unsubscribe = fetchMedia((snapshot) => {
            if (snapshot.empty) {
                setGallery([]);
                return;
            }

            setGallery(snapshot.docs.map((d) => d.data()));
        });

        return () => unsubscribe();
    }, []);

    return (
        <Fancybox
            options={{
                placeFocusBack: false,
                Toolbar: {
                    display: {
                        right: ["zoomIn", "download", "close"],
                    },
                },
                Carousel: { infinite: false },
            }}
        >
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-1 p-4">
                {gallery.map((media) => (
                    <div key={media.id} className="relative">
                        <a
                            draggable="false"
                            href={media.url}
                            data-fancybox="gallery"
                        >
                            <img
                                src={media.url}
                                alt="Gallery Image"
                                className="w-full h-[300px] object-cover object-center rounded-lg shadow-md"
                            />
                            <span className="absolute bottom-1 right-1 p-1 text-xs bg-black/40 rounded">
                                {format(media.createdAt, "MM/dd/yyyy")}
                            </span>
                        </a>
                    </div>
                ))}
            </div>
        </Fancybox>
    );
}
