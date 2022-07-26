import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDWy8cijaVdfJ5ewhuoqQJm9NbVRgojnUo",
  authDomain: "m-library-929cc.firebaseapp.com",
  projectId: "m-library-929cc",
  storageBucket: "m-library-929cc.appspot.com",
  messagingSenderId: "224232173500",
  appId: "1:224232173500:web:3a541fab932307c39fc5b9",
  measurementId: "G-35DHQD4JZ4"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const updateUserDatabase = async (user, uid) => {
  if (typeof user !== "object") return;

  const docRef = doc(db, "users", uid);
  await setDoc(docRef, { ...user, uid });
};

const getUserFromDatabase = async (uid) => {
  const docRef = doc(db, "users", uid);
  const result = await getDoc(docRef);

  if (!result.exists()) return null;
  return result.data();
};

const uploadImage = (file, progressCallback, urlCallback, errorCallback) => {
  if (!file) {
    errorCallback("File not found");
    return;
  }

  const fileType = file.type;
  const fileSize = file.size / 1024 / 1024;

  if (!fileType.includes("image")) {
    errorCallback("File must an image");
    return;
  }
  if (fileSize > 2) {
    errorCallback("File must smaller than 2MB");
    return;
  }

  const storageRef = ref(storage, `images/${file.name}`);

  const task = uploadBytesResumable(storageRef, file);

  task.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
    },
    (error) => {
      errorCallback(error.message);
    },
    () => {
      getDownloadURL(storageRef).then((url) => {
        urlCallback(url);
      });
    }
  );
};

const addProjectInDatabase = async (project) => {
  if (typeof project !== "object") return;

  const collectionRef = collection(db, "projects");
  await addDoc(collectionRef, { ...project });
};

const updateProjectInDatabase = async (project, pid) => {
  if (typeof project !== "object") return;

  const docRef = doc(db, "projects", pid);
  await setDoc(docRef, { ...project });
};

const getAllProjects = async () => {
  return await getDocs(collection(db, "projects"));
};

const getAllProjectsForUser = async (uid) => {
  if (!uid) return;

  const collectionRef = collection(db, "projects");
  const condition = where("refUser", "==", uid);
  const dbQuery = query(collectionRef, condition);

  return await getDocs(dbQuery);
};

const deleteProject = async (pid) => {
  const docRef = doc(db, "projects", pid);
  await deleteDoc(docRef);
};

export {
  app as default,
  auth,
  db,
  updateUserDatabase,
  getUserFromDatabase,
  uploadImage,
  addProjectInDatabase,
  updateProjectInDatabase,
  getAllProjects,
  getAllProjectsForUser,
  deleteProject,
};