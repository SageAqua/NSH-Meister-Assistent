import type { Customer, Project } from "@/types"

export type OfflineProject = Project & { customers: Customer | null }

export type QueuedTodayWorkSession = {
  id: string
  projectId: string
  date: string
  startTime: string
  endTime: string
  helpersCount: number
  createdAt: string
}

const DB_NAME = "nsh-meister-offline"
const DB_VERSION = 1
const PROJECT_STORE = "projects"
const WORK_QUEUE_STORE = "todayWorkQueue"

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is not available."))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(WORK_QUEUE_STORE)) {
        const store = db.createObjectStore(WORK_QUEUE_STORE, { keyPath: "id" })
        store.createIndex("createdAt", "createdAt")
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function requestAll<T>(request: IDBRequest<T[]>) {
  return new Promise<T[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function cacheOfflineProjects(projects: OfflineProject[]) {
  if (!canUseIndexedDb()) return
  const db = await openDb()
  const tx = db.transaction(PROJECT_STORE, "readwrite")
  const store = tx.objectStore(PROJECT_STORE)
  store.clear()
  projects.forEach((project) => store.put(project))
  await txDone(tx)
  db.close()
}

export async function getOfflineProjects() {
  if (!canUseIndexedDb()) return []
  const db = await openDb()
  const tx = db.transaction(PROJECT_STORE, "readonly")
  const projects = await requestAll<OfflineProject>(tx.objectStore(PROJECT_STORE).getAll())
  db.close()
  return projects
}

export async function enqueueTodayWorkSession(
  session: Omit<QueuedTodayWorkSession, "id" | "createdAt">
) {
  const db = await openDb()
  const queued: QueuedTodayWorkSession = {
    ...session,
    id: `${session.projectId}:${session.date}`,
    createdAt: new Date().toISOString(),
  }
  const tx = db.transaction(WORK_QUEUE_STORE, "readwrite")
  tx.objectStore(WORK_QUEUE_STORE).put(queued)
  await txDone(tx)
  db.close()
  return queued
}

export async function getQueuedTodayWorkSessions() {
  if (!canUseIndexedDb()) return []
  const db = await openDb()
  const tx = db.transaction(WORK_QUEUE_STORE, "readonly")
  const queued = await requestAll<QueuedTodayWorkSession>(tx.objectStore(WORK_QUEUE_STORE).getAll())
  db.close()
  return queued.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function removeQueuedTodayWorkSession(id: string) {
  if (!canUseIndexedDb()) return
  const db = await openDb()
  const tx = db.transaction(WORK_QUEUE_STORE, "readwrite")
  tx.objectStore(WORK_QUEUE_STORE).delete(id)
  await txDone(tx)
  db.close()
}
