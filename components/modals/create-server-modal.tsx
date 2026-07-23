"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";
import { FileUpload } from "../file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z
    .string()
    .min(5, "Server name must be at least 5 characters")
    .max(32, "Server name can be at most 32 characters"),
  imageUrl: z.string().min(1, {
    message: "Image is required.",
  }),
  description: z
    .string()
    .min(0)
    .max(200, "Description can be at most 200 characters."),
});
export const CreateServerModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "createServer";
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/servers", values);
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden rounded-lg">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold normal-case tracking-normal">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-base text-zinc-500">
            Give your server a personality with a name and an image. It will be
            changeable whenever you wish.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 px-6">
            <Controller
              name="imageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                    Server Image
                  </FieldLabel>
                  <FileUpload
                    endpoint="serverImage"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server name
                    </FieldLabel>
                    <Input
                      id="name"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      className="bg-zinc-300/50 border-0 focus-visible:ring-0
                                text-black focus-visible:ring-offset-0 px-3"
                      placeholder="Enter server name..."
                      {...field}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server Description
                    </FieldLabel>
                    <InputGroup
                      className="bg-zinc-300/50 border-0 focus-visible:ring-0
                                text-black focus-visible:ring-offset-0 px-3"
                    >
                      <InputGroupTextarea
                        {...field}
                        id="description"
                        placeholder="Enter server description..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/200 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="rounded-lg cursor-pointer"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
