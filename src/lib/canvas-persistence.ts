import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CanvasScene {
  id: string;
  data: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export class CanvasPersistence {
  private sceneId: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(sceneId: string) {
    this.sceneId = sceneId;
  }

  async loadScene(): Promise<CanvasScene | null> {
    try {
      // Check localStorage cache first
      const cached = localStorage.getItem(`canvas_scene_${this.sceneId}`);
      if (cached) {
        const cachedScene = JSON.parse(cached);
        // Load from Firestore in background to update cache
        this.loadFromFirestore().then((freshScene) => {
          if (freshScene) {
            localStorage.setItem(`canvas_scene_${this.sceneId}`, JSON.stringify(freshScene));
          }
        }).catch(() => {});
        return cachedScene;
      }

      // Load from Firestore if not cached
      const scene = await this.loadFromFirestore();
      if (scene) {
        localStorage.setItem(`canvas_scene_${this.sceneId}`, JSON.stringify(scene));
      }
      return scene;
    } catch (error) {
      console.error('Error loading scene:', error);
      return null;
    }
  }

  private async loadFromFirestore(): Promise<CanvasScene | null> {
    try {
      const docRef = doc(db, 'scenes', this.sceneId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as CanvasScene;
      }
      return null;
    } catch (error) {
      console.error('Error loading scene from Firestore:', error);
      return null;
    }
  }

  async saveScene(canvasData: string, title?: string): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'scenes', this.sceneId);
        const docSnap = await getDoc(docRef);

        const now = new Date().toISOString();

        if (docSnap.exists()) {
          await updateDoc(docRef, {
            data: canvasData,
            updatedAt: now,
            ...(title && { title })
          });
        } else {
          await setDoc(docRef, {
            id: this.sceneId,
            data: canvasData,
            createdAt: now,
            updatedAt: now,
            title: title || 'Untitled Canvas'
          });
        }

        // Update localStorage cache
        const cachedScene = {
          id: this.sceneId,
          data: canvasData,
          createdAt: docSnap.exists() ? docSnap.data().createdAt : now,
          updatedAt: now,
          title: title || docSnap.exists() ? docSnap.data().title : 'Untitled Canvas'
        };
        localStorage.setItem(`canvas_scene_${this.sceneId}`, JSON.stringify(cachedScene));
      } catch (error) {
        console.error('Error saving scene:', error);
      }
    }, 1000);
  }

  cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}