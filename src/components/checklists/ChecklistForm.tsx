import { Checklist, ChecklistItem } from "@/models";
import { Input } from "../ui/input";
import { ChecklistFormItem } from "./ChecklistFormItem";
import {
    ChangeEvent,
    FormEvent,
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAuthContext } from "@/helpers/authContext";
import { saveChecklist } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

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
    const [items, setItems] = useState<ChecklistItem[]>([]);

    useEffect(() => {
        if (!checklist) return;
        setItems(checklist.items);
    }, [checklist]);

    const onSubmit = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (loading) return;

        updateLoadingState(true);

        const title = titleRef.current?.value ?? "";

        const data: Omit<Checklist, "id"> = {
            title: title,
            items: items,
            createdAt: new Date().getTime(),
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

    const focusLastItem = () => {
        setTimeout(() => {
            const itemsWrapperEl = document.getElementById("items")!;
            const itemsEl =
                itemsWrapperEl.querySelectorAll("input[type='text']");
            (itemsEl[itemsEl.length - 1] as HTMLElement).focus();
        }, 1);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, id: number) => {
        if (loading) return;

        const BYPASS_KEYS = ["Backspace", "Enter"];

        if (BYPASS_KEYS.includes(event.key)) {
            if (event.key === "Enter") {
                event.preventDefault();
                const textInputs =
                    document.querySelectorAll("input[type='text']");
                (textInputs[textInputs.length - 1] as HTMLElement).focus();
            } else if (event.key === "Backspace") {
                if (event.currentTarget.value !== "") return;

                const updated = items.filter((item) => item.id !== id);
                setItems(updated);
                focusLastItem();

                if (updated.length === 0) {
                    const textInputs =
                        document.querySelectorAll("input[type='text']");
                    (textInputs[textInputs.length - 1] as HTMLElement).focus();
                }
            }
        }
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

    const onTextChange = (id: number, value: string) => {
        const current = [...items];
        const updatedItems = current.map((item) => {
            if (item.id === id) item.content = value;
            return item;
        });

        setItems(updatedItems);
    };

    const onNewItemChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;

        setItems((items) => {
            if (items.length > 0) {
                return [
                    ...items,
                    {
                        id: items[items.length - 1].id + 1,
                        checked: false,
                        content: value,
                    },
                ];
            } else {
                return [
                    {
                        id: 1,
                        checked: false,
                        content: value,
                    },
                ];
            }
        });

        focusLastItem();

        event.currentTarget.value = "";
    };

    const onNewItemKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            return;
        }

        if (event.key === "Backspace") {
            focusLastItem();
        }
    };

    return (
        <form
            id={id}
            className="flex flex-col min-h-[1px] flex-1 overflow-hidden"
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
                    {items?.map((item) => (
                        <ChecklistFormItem
                            item={item}
                            key={item.id}
                            onCheckedChange={onCheckedChange}
                            onTextChange={onTextChange}
                            onKeyDown={onKeyDown}
                        />
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <Plus className="text-muted-foreground" />
                    <Input
                        className="px-0 border-0"
                        type="text"
                        placeholder="List Item"
                        onKeyDown={onNewItemKeyDown}
                        onChange={onNewItemChange}
                    />
                </div>
            </div>
        </form>
    );
};
