"use client";

import { useActionState, useState } from "react";
import { Button, Text, TextField } from "@/components/ui";
import { saveBasicProfile } from "./actions";

export function ProfileForm({ destination }: { destination: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, action, pending] = useActionState(saveBasicProfile, {});
  return (
    <form action={action} noValidate className="flex flex-col gap-lg">
      <input type="hidden" name="next" value={destination} />
      <TextField
        id="first_name"
        name="first_name"
        label="First name"
        required
        autoComplete="given-name"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        error={state.fieldErrors?.firstName}
      />
      <TextField
        id="last_name"
        name="last_name"
        label="Last name"
        required
        autoComplete="family-name"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        error={state.fieldErrors?.lastName}
      />
      {state.error && <Text role="alert" className="rounded-field border-l-2 border-solid border-brand-red bg-canvas px-md py-sm text-ink">{state.error}</Text>}
      <Button disabled={pending} type="submit" className="w-full">Continue</Button>
    </form>
  );
}
