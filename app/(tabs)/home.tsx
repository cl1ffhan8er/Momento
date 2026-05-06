import { getSharedAlbums } from "@/src/services/firebase/albums";
import { auth } from "@/src/services/firebase/auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function Home() {
  const [albums, setAlbums] = useState<any[]>([]);

  const fetchAlbums = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getSharedAlbums(user.uid);
    setAlbums(data);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <View>
      <Button title="Create Album" onPress={() => router.push("./create-album")} />

      {albums.map((album) => (
        <Text key={album.id}>{album.title}</Text>
      ))}
    </View>
  );
}