import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions["bulk-create"]["$post"]({
        json,
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success("Transactions created!!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      //   TODO: Also invalidate summary
    },
    onError: (error) => {
      toast.success("Failed to create transactions!!");
    },
  });

  return mutation;
};