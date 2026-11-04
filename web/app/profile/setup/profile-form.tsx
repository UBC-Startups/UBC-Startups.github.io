"use client";

import { useActionState } from "react";
import { Button, Text, TextField } from "@/components/ui";
import { saveBasicProfile } from "./actions";

export function ProfileForm({ destination }: { destination: string }) {
  const [state, action, pending] = useActionState(saveBasicProfile, {});
  return (
    <form action={action} className="flex flex-col gap-lg">
      <input type="hidden" name="next" value={destination} />
      <TextField id="first_name" name="first_name" label="First name" required autoComplete="given-name" />
      <TextField id="last_name" name="last_name" label="Last name" required autoComplete="family-name" />
      {state.error && <Text role="alert">{state.error}</Text>}
      <Button disabled={pending} type="submit">Continue</Button>
    </form>
  );
}
