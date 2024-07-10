import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES, icons, images } from "@/constants";
import { addNewComment, addNewLike, removeLike } from "@/services/firestoreAPI";
import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, database } from "@/services/firebaseConfig";
import i18n from "@/constants/i18n";
import { AntDesign } from "@expo/vector-icons";
import { Link, useNavigation, useRouter } from "expo-router";

const ForumItem = ({ post, refToCommentItem }) => {
  const [isLikeIconPressed, setIsLikeIconPressed] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [likeCount, setLikeCount] = useState(post?.like || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  console.log(auth);
  useEffect(() => {
    if (!post?.postId) return;

    const likesRef = collection(database, "likes");
    const likesQuery = query(likesRef, where("postId", "==", post.postId));

    const unsubscribeLikes = onSnapshot(likesQuery, (likesSnapshot) => {
      setLikeCount(likesSnapshot.size);
    });

    const commentsRef = collection(database, "comments");
    const commentsQuery = query(
      commentsRef,
      where("postId", "==", post.postId)
    );

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (commentsSnapshot) => {
        setCommentCount(commentsSnapshot.size);
      }
    );

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [post?.postId, getAuth().currentUser]);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    } else {
      return text;
    }
  };

  useEffect(() => {
    if (!post?.postId) return;

    const checkLikedPost = async () => {
      const userId = getAuth().currentUser?.uid;
      if (userId) {
        const postId = post.postId;
        const userLiked = await checkUserLikedPost(userId, postId);
        setIsLikeIconPressed(userLiked);
      }
    };
    checkLikedPost();
  }, [post?.postId, getAuth().currentUser]);

  const checkUserLikedPost = async (userId, postId) => {
    const likesCollection = collection(database, "likes");
    const likesQuery = query(
      likesCollection,
      where("userId", "==", userId),
      where("postId", "==", postId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.size > 0;
  };

  const removeLike = async (userId, postId) => {
    const likesCollection = collection(database, "likes");
    const likesQuery = query(
      likesCollection,
      where("userId", "==", userId),
      where("postId", "==", postId)
    );
    const likesSnapshot = await getDocs(likesQuery);

    if (likesSnapshot.size > 0) {
      const likeDoc = likesSnapshot.docs[0];
      await deleteDoc(doc(database, "likes", likeDoc.id));
    }
  };

  const handleLikeIconPress = async () => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !post?.postId) return;
    const postId = post.postId;
    const postRef = doc(database, "posts", postId);
    setIsLikeIconPressed(!isLikeIconPressed);
    setIsDisabled(true);
    try {
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const currentLikes = postDoc.data().like;
        if (isLikeIconPressed) {
          await removeLike(userId, postId);
          await updateDoc(postRef, { like: currentLikes - 1 });
        } else {
          await addNewLike({ userId, postId, createdAt: new Date() });
          await updateDoc(postRef, { like: currentLikes + 1 });
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du nombre de likes : ",
        error
      );
    }
    setIsDisabled(false);
  };

  const handleCommentIconPress = () => {
    if (!post) return;
    navigation.navigate("CommentScreen", {
      post,
      refToCommentItem,
    });
  };

  const handleCommentSent = async () => {
    const userId = getAuth().currentUser?.uid;
    if (commentValue.trim() !== "" && post?.postId && userId) {
      const commentData = {
        content: commentValue,
        postId: post.postId,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const response = await addNewComment(commentData);
        if (response && response.msg === "no-auth") {
          console.log("L'utilisateur n'est pas authentifié.");
        } else {
          console.log("Commentaire ajouté avec succès.");
          setCommentValue("");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire : ", error);
      }
    } else {
      console.log("Commentaire vide ou post non défini");
    }
  };

  const formattedDate = post?.createdAt
    ? new Date(post.createdAt.toDate()).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
      })
    : "Date non disponible";

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "(drawer)/(forum)/oneforum",
          params: { post },
        });
      }}
      style={styles.container}
      className=""
    >
      <View style={[styles.header, {}]}>
        <Image
          source={images.doctor03}
          style={{
            width: 50,
            height: 50,
            borderRadius: 100,
            borderWidth: 0.5,
            borderColor: "gray",
          }}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.authorName}>{post.authorName || "Anonyme"}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {post?.title || "Titre non disponible"}
        </Text>
        <Text style={styles.body}>
          {truncateText(post.description || "Contenu non disponible", 500)}
        </Text>
      </View>

      <View style={styles.reactions}>
        <View style={styles.like}>
          <TouchableOpacity onPress={handleLikeIconPress} disabled={isDisabled}>
            <AntDesign
              name={isLikeIconPressed ? "heart" : "hearto"}
              color={isLikeIconPressed ? COLORS.accent600 : COLORS.gray}
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles.textSmall}>{likeCount} réactions</Text>
        </View>
        <TouchableOpacity style={styles.comment} onPress={() => {}}>
          <View style={styles.comment}>
            <Image source={icons.message} style={styles.commentIcon} />
            <Text style={styles.textSmall}>{commentCount} commentaires</Text>
          </View>
        </TouchableOpacity>
      </View>

      {getAuth().currentUser && (
        <View className="bg-gray-100 rounded-md" style={styles.commentBox}>
          <TextInput
            multiline
            placeholder={i18n.t("ecrireUnCommentaire")}
            style={styles.commentInput}
            value={commentValue}
            onChangeText={setCommentValue}
          />
          <TouchableOpacity onPress={handleCommentSent}>
            <Image source={icons.send} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral100,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: "98%",
    marginHorizontal: "auto",
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    gap: 8,
  },
  headerTextContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontFamily: "Bold",
    fontSize: SIZES.small,
    color: "#555",
  },
  date: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#888",
  },
  content: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: "SBold",
    fontSize: SIZES.large,
    marginBottom: 10,
  },
  body: {
    lineHeight: 22,
  },
  reactions: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 5,
  },
  like: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  comment: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  commentIcon: {
    width: 22,
    height: 22,
  },
  textSmall: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#888",
  },
  commentBox: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 100,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  commentInput: {
    width: "90%",
    height: "100%",
    fontFamily: "Regular",
  },
  sendIcon: {
    width: 19,
    height: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForumItem;
