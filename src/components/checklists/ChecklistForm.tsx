import { Checklist, ChecklistItem } from "@/models";
import { Input } from "../ui/input";
import { ChecklistFormItem } from "./ChecklistFormItem";
import {
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAuthContext } from "@/helpers/authContext";
import { deleteChecklist, saveChecklist } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";

interface FormProps {
    id?: string;
    checklist?: Checklist;
    loading: boolean;
    updateLoadingState: (state: boolean) => void;
}

export const ChecklistForm = ({ id, checklist, loading, updateLoadingState }: FormProps) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const itemInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState<string>("");
    const [items, setItems] = useState<ChecklistItem[]>([]);

    useEffect(() => {
        if (!checklist) return;
        setItems(checklist.items);
    }, [checklist]);

    const onSubmit = async (
        title: string,
        items: ChecklistItem[]
    ): Promise<void> => {
        if (loading) return;

        updateLoadingState(true);

        const data: Omit<Checklist, "id"> = {
            title: title,
            items: items,
            createdAt: new Date().getTime(),
            createdBy: user?.uid ?? "",
        };

        try {
            const newId = await saveChecklist(data, id);

            if (!id) {
                navigate({ to: `/checklists/$id`, params: { id: newId } })
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            updateLoadingState(false);
        }
    };

    const addValueToItem = (value: string) => {
        if (!value) return;

        // Copied items values to itemsCopy to make it pseudo immutable
        const itemsCopy = [...items];

        // We'll take the last id from the stack
        const lastItem = itemsCopy[itemsCopy.length - 1];
        const lastItemId = lastItem?.id ?? 1;

        const data: ChecklistItem[] = [
            ...itemsCopy,
            {
                id: lastItemId + 1,
                content: value,
                checked: false,
            },
        ];

        setItems(data);
        itemInputRef.current!.value = "";
        onSubmit(title, data);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        if (loading) return;

        event.preventDefault();
        const { value } = event.currentTarget;
        addValueToItem(value);
    };

    const onDebouncedTitleChange = useDebouncedCallback((value) => {
        if (loading) return;

        setTitle(value);
        onSubmit(value, items);
    }, 500);

    const onCheckedChange = async (id: number, checked: boolean) => {
        if (loading) return;

        const itemsCopy = items.map(item => {
            if (item.id === id) {
                item.checked = checked;
            }

            return item;
        });

        setItems(itemsCopy);
        onSubmit(title, itemsCopy);
    }

    const onItemRemove = (id: number) => {
        if (loading) return;

        const itemsCopy = items.filter((i) => i.id !== id);
        setItems(itemsCopy);
        onSubmit(title, itemsCopy);
    };

    return (
        <form className="mt-4">
            <div className="mb-4">
                <label className="inline-block mb-2" htmlFor="title">
                    Title
                </label>
                <Input
                    title={title}
                    defaultValue={checklist?.title}
                    name="title"
                    type="text"
                    placeholder="My checklist"
                    onChange={(e) => onDebouncedTitleChange(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="inline-block mb-2">Items</label>
                {items?.map((item) => (
                    <ChecklistFormItem
                        item={item}
                        key={item.id}
                        onCheckedChange={onCheckedChange}
                        onItemRemove={onItemRemove}
                    />
                ))}
            </div>
            <Input
                ref={itemInputRef}
                onKeyDown={onKeyDown}
                placeholder="Enter text"
            />
            <div className="mt-1 text-xs text-muted-foreground">Press Enter to add item</div>
        </form>
    );
};
