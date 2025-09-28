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
      const docRef = doc(db, 'scenes', this.sceneId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as CanvasScene;
      }
      return null;
    } catch (error) {
      console.error('Error loading scene:', error);
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