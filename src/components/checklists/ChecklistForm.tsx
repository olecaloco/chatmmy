import { Checklist, ChecklistItem } from "@/models";
import { Input } from "../ui/input";
import { ChecklistFormItem } from "./ChecklistFormItem";
import { SubmitEvent, useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/helpers/authContext";
import { saveChecklist } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

interface FormProps {
    id?: string;
    checklist?: Checklist;
    loading: boolean;
    updateLoadingState: (state: boolean) => void;
}

export const ChecklistForm = ({
    id,
    checklist,
    loading,
    updateLoadingState,
}: FormProps) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const titleRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<ChecklistItem[]>([
        { id: 1, content: "", checked: false },
    ]);

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const pendingFocusIndex = useRef<number | null>(null);

    useEffect(() => {
        if (!checklist) return;
        setItems(checklist.items);
    }, [checklist]);

    useEffect(() => {
        if (pendingFocusIndex.current !== null) {
            inputRefs.current[pendingFocusIndex.current]?.focus();
            pendingFocusIndex.current = null;
        }
    }, [items]);

    const setInputRef =
        (index: number) =>
        (el: HTMLInputElement | null): void => {
            inputRefs.current[index] = el;
        };

    const onSubmit = async (
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (loading) return;

        updateLoadingState(true);

        const title = titleRef.current?.value ?? "";

        const data: Omit<Checklist, "id"> = {
            title: title,
            items: items,
            createdAt: checklist?.createdAt ?? new Date().getTime(),
            createdBy: user?.uid ?? "",
        };

        try {
            const newId = await saveChecklist(data, id);

            if (!id || id === "createForm") {
                navigate({ to: `/checklists/$id`, params: { id: newId } });
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            updateLoadingState(false);
        }
    };

    const addItem = (index = items.length - 1) => {
        const updated = [...items];
        updated.splice(index + 1, 0, {
            id: items.length,
            content: "",
            checked: false,
        });

        pendingFocusIndex.current = index + 1;
        setItems(updated);
    };

    const deleteItem = (index: number) => {
        if (items.length === 1) return;

        const updated = items.filter((_, i) => i !== index);

        const nextIndex = index > 0 ? index - 1 : 0;
        pendingFocusIndex.current = nextIndex;

        setItems(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem(index);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = index + 1;
            if (next < items.length) {
                inputRefs.current[next]?.focus();
            }
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = index - 1;
            if (prev >= 0) {
                inputRefs.current[prev]?.focus();
            }
        }

        if (e.key === "Backspace" && items[index].content === "") {
            e.preventDefault();

            if (items.length > 1) {
                deleteItem(index);
            }

            return;
        }

        if (e.key === "Delete" && items[index].content === "") {
            e.preventDefault();

            if (items.length > 1) {
                const nextIndex = Math.min(index, items.length - 2); // move down if possible
                pendingFocusIndex.current = nextIndex;

                setItems(items.filter((_, i) => i !== index));
            }

            return;
        }
    };

    const handleChange = (index: number, value: string) => {
        const updated = [...items];
        updated[index].content = value;
        setItems(updated);
    };

    const onCheckedChange = async (id: number, checked: boolean) => {
        if (loading) return;

        const itemsCopy = items.map((item) => {
            if (item.id === id) {
                item.checked = checked;
            }

            return item;
        });

        setItems(itemsCopy);
    };

    return (
        <form
            id={id}
            className="flex flex-col min-h-px flex-1 overflow-hidden"
            onSubmit={onSubmit}
        >
            <div className="my-4">
                <label className="inline-block mb-2" htmlFor="title">
                    Title
                </label>
                <Input
                    ref={titleRef}
                    defaultValue={checklist?.title}
                    name="title"
                    type="text"
                    placeholder="My checklist"
                    required
                />
            </div>

            <div id="wrapper" className="flex-1 overflow-y-auto mb-10">
                <div id="items">
                    {items?.map((item, index) => (
                        <ChecklistFormItem
                            setInputRef={setInputRef}
                            index={index}
                            item={item}
                            key={item.id}
                            onCheckedChange={onCheckedChange}
                            onTextChange={(_, e) =>
                                handleChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                    ))}
                </div>
                <button
                    className="mt-2 flex items-center gap-1 text-gray-500 text-sm hover:text-white transition cursor-pointer"
                    onClick={() => addItem()}
                    type="button"
                >
                    <PlusIcon className="w-4" />
                    Add Item
                </button>
            </div>
        </form>
    );
};
