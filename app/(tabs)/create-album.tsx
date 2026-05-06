import { createAlbum } from "@/src/services/firebase/albums";
import { auth } from "@/src/services/firebase/auth";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";

export default function CreateAlbum() {
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    const user = auth.currentUser;

    if (!user) return alert("Not logged in");

    try {
      await createAlbum(title, user.uid);
      alert("Album created!");
      setTitle("");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Album Title"
        value={title}
        onChangeText={setTitle}
      />
      <Button title="Create Album" onPress={handleCreate} />
    </View>
  );
}