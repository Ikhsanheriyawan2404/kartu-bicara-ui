"use client"

import { useState } from "react"
import { Heart, Users, ArrowRight, RotateCcw, Share2, Plus, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { inputQuestion, reqLoadQuestions, reqStartGame, reqTotalQuestion } from "@/api/questions"
import { dateFormat } from "@/lib/utils"
import { toast, Toaster } from "sonner"

type Screen = "landing" | "multiplayer-setup" | "game" | "session-end" | "manage-questions"
type GameMode = "solo" | "multiplayer"
type Category = "couples" | "friends"

const categoryMap: Record<Category, number> = {
  friends: 1,
  couples: 2,
};

interface Question {
  id: number
  title: string
  category_id?: number
  category_name?: string
  created_at?: string
}

export default function TalkDeckApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [gameMode, setGameMode] = useState<GameMode>("solo")
  const [category, setCategory] = useState<Category>("couples")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [cardsPlayed, setCardsPlayed] = useState(0)
  const [totalQuestion, setTotalQuestion] = useState(0)

  const [hasMoreQuestions, setHasMoreQuestions] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ title: "", category_id: 2 })
  const [formErrors, setFormErrors] = useState<{ title?: string; category?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputText, setInputText] = useState("")

  const startGame = async (mode: GameMode) => {
    setGameMode(mode)
    if (mode === "multiplayer") {
      setCurrentScreen("multiplayer-setup")
    } else {
      const questions = await reqStartGame(categoryMap[category])
      setQuestions(questions)
      setCurrentScreen("game")
      setCardsPlayed(0)
      setCurrentCardIndex(0)
      setIsCardFlipped(false)
    }
  }

  const flipCard = () => {
    setIsCardFlipped(!isCardFlipped)
  }

  const nextCard = () => {
    const newCardsPlayed = cardsPlayed + 1
    setCardsPlayed(newCardsPlayed)

    if (newCardsPlayed >= 10) {
      setCurrentScreen("session-end")
    } else {
      setCurrentCardIndex((prev) => (prev + 1) % questions.length)
      setIsCardFlipped(false)
      if (gameMode === "multiplayer") {
        setIsPlayerTurn(!isPlayerTurn)
      }
    }
  }

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(newRoomId)
    setTimeout(() => {
      setCurrentScreen("game")
      setCardsPlayed(0)
      setCurrentCardIndex(0)
      setIsCardFlipped(false)
    }, 2000)
  }

  const joinRoom = () => {
    if (roomId.length >= 4) {
      setCurrentScreen("game")
      setCardsPlayed(0)
      setCurrentCardIndex(0)
      setIsCardFlipped(false)
    }
  }

  const playAgain = () => {
    setCurrentScreen("landing")
    setCardsPlayed(0)
    setCurrentCardIndex(0)
    setIsCardFlipped(false)
    setRoomId("")
  }
  
  const loadTotalQuestion = async () => {
    try {
      const data = await reqTotalQuestion();
      setTotalQuestion(data.total);
    } catch (error) {
      console.error("Error loading total questions:", error)
    }
  }

  const loadQuestions = async () => {
    try {
      const lastId = questions.length > 0 ? questions[questions.length - 1].id : undefined
      const newQuestions: Question[] = await reqLoadQuestions(lastId)
      setQuestions(prev => [...prev, ...newQuestions])
      setHasMoreQuestions(newQuestions.length > 0)
    } catch (err) {
      console.error("Error loading questions:", err)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
  
    // Cegah submit ganda
    if (isSubmitting) return

    const errors: { title?: string; category_id?: string } = {}

    const title = inputText.trim()
    if (!title) {
      errors.title = "Pertanyaan wajib diisi"
    }

    if (!newQuestion.category_id) errors.category_id = "Kategori wajib dipilih"
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)

      const createdQuestion = await inputQuestion(newQuestion.category_id, title)
  
      setQuestions(prev => [createdQuestion, ...prev])
      setNewQuestion({ title: "", category_id: 2 })
      setShowCreateModal(false)
  
      toast.success("Berhasil", {
        description: "Pertanyaan berhasil ditambahkan 🎉",
      })
    } catch (err: any) {
      console.error("Error:", err)
  
      // Ambil pesan dari response JSON jika ada
      const description = err?.message || "Terjadi kesalahan. Coba lagi nanti."
      toast.error("Gagal menambahkan pertanyaan", {
        description,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (!scrollTimeout && !isLoadingQuestions && hasMoreQuestions) {
        // Tampilkan animasi loading SEBELUM delay
        setIsLoadingQuestions(true);
  
        scrollTimeout = setTimeout(() => {
          loadQuestions();
          scrollTimeout = null;
        }, 1000); // delay 1 detik
      }
    }
  };

  return (
    <>
    <Toaster />
    <div className="min-h-screen pb-16 bg-gradient-to-br from-pink-100 via-purple-50 to-orange-100">
      {/* Landing Page */}
      {currentScreen === "landing" && (
        <div className="flex flex-col items-center justify-center min-h-screen pb-16 p-6 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Kartu Bicara</h1>
            <p className="text-lg text-gray-600 max-w-sm">Mulai obrolan bermakna melalui kartu.</p>
          </div>

          <div className="w-full max-w-sm space-y-4 mb-8">
            <Button
              onClick={async () => await startGame("solo")}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
            >
              Mulai Sendiri
            </Button>
            <Button
              // onClick={() => startGame("multiplayer")}
              onClick={() => toast("Fitur multiplayer masih dalam pengembangan. Segera hadir!")}
              className="w-full h-14 text-lg bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white rounded-xl shadow-lg"
            >
              Main Berdua
            </Button>
          </div>

          <div className="w-full max-w-sm">
            <p className="text-sm text-gray-600 mb-4">Mulai dari kategori yang kamu inginkan:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={category === "couples" ? "default" : "outline"}
                onClick={() => setCategory("couples")}
                className={`h-12 rounded-xl ${
                  category === "couples"
                    ? "bg-gradient-to-r from-pink-400 to-red-400 text-white"
                    : "border-pink-200 text-pink-600 hover:bg-pink-50"
                }`}
              >
                <Heart className="w-4 h-4 mr-2" />
                Untuk Pasangan 
              </Button>
              <Button
                variant={category === "friends" ? "default" : "outline"}
                onClick={() => setCategory("friends")}
                className={`h-12 rounded-xl ${
                  category === "friends"
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                    : "border-blue-200 text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Untuk Teman
              </Button>
            </div>
            <Button
              onClick={async() => {
                setCurrentScreen("manage-questions");
                await loadQuestions();
                await loadTotalQuestion();
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-purple-600 hover:underline mt-4"
            >
              🎯 Yuk, bantu kontribusi pertanyaan seru disini!
            </Button>
            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
              <p className="text-xs text-gray-500">
                © {new Date().toLocaleDateString('id-ID', {
                  year: 'numeric'
                })}{' '}
                <a
                  href="https://brogrammer.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Brogrammer.id
                </a>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multiplayer Setup */}
      {currentScreen === "multiplayer-setup" && (
        <div className="flex flex-col items-center justify-center min-h-screen pb-16 p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Main Bareng</h2>
              <p className="text-gray-600">Buat atau gabung room untuk memulai</p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-gray-800 mb-4">Buat Room</h3>
                  {roomId ? (
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Room ID</p>
                        <p className="text-2xl font-bold text-purple-600">{roomId}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Kirim ID ini ke partner ngobrolmu</p>
                      <div className="flex items-center justify-center text-orange-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mr-2"></div>
                        Lagi nunggu partner gabung nih...
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={createRoom}
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Room
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-gray-800 mb-4">Gabung Room</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className="h-12 rounded-xl border-gray-200"
                    />
                    <Button
                      onClick={joinRoom}
                      disabled={roomId.length < 4}
                      className="w-full h-12 bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white rounded-xl disabled:opacity-50"
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      Gabung Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={() => setCurrentScreen("landing")} variant="ghost" className="w-full mt-6 text-gray-600">
              Kembali ke menu utama
            </Button>
            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
              <p className="text-xs text-gray-500">
                © {new Date().toLocaleDateString('id-ID', {
                  year: 'numeric'
                })}{' '}
                <a
                  href="https://brogrammer.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Brogrammer.id
                </a>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Screen */}
      {currentScreen === "game" && (
        <div className="flex flex-col items-center justify-center min-h-screen pb-16 p-6">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Kartu {cardsPlayed + 1} dari 10</div>
                <div className="text-sm text-gray-600 capitalize">
                  {category === "couples" ? "❤️ Couples" : "🤝 Friends"}
                </div>
              </div>
              {gameMode === "multiplayer" && (
                <div
                  className={`text-center py-2 px-4 rounded-full text-sm font-medium ${
                    isPlayerTurn ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {isPlayerTurn ? "✨ Your Turn" : "⏳ Waiting for your partner..."}
                </div>
              )}
            </div>

            {/* Card */}
            <div className="mb-8 perspective-1000">
              <div
                className={`relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                  isCardFlipped ? "rotate-y-180" : ""
                }`}
                onClick={flipCard}
              >
                {/* Card Back */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <Card className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 border-0 shadow-2xl rounded-3xl">
                    <CardContent className="flex items-center justify-center h-full p-8">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                          <Heart className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium">Ketuk untuk membuka</p>
                        <p className="text-sm opacity-80 mt-2">pertanyaan pembuka obrolanmu</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Card Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <Card className="w-full h-full bg-white border-0 shadow-2xl rounded-3xl">
                    <CardContent className="flex items-center justify-center h-full p-8">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-lg text-gray-800 leading-relaxed">
                          {questions.length > 0 ? questions[currentCardIndex].title : "Loading..."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {isCardFlipped && (
                <Button
                  onClick={nextCard}
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-xl shadow-lg"
                >
                  Kartu Selanjutnya
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <Button onClick={() => {
                setQuestions([])
                setCurrentScreen("landing")
              }} variant="ghost" className="w-full text-gray-600">
                Akhir Sesi
              </Button>
              {/* Footer */}
              <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
                <p className="text-xs text-gray-500">
                  © {new Date().toLocaleDateString('id-ID', {
                    year: 'numeric'
                  })}{' '}
                  <a
                    href="https://brogrammer.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Brogrammer.id
                  </a>. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Questions Screen */}
      {currentScreen === "manage-questions" && (
        <div className="min-h-screen pb-16 p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Daftar Pertanyaan</h1>
                <p className="text-sm text-gray-600 mt-1">Total: {totalQuestion} pertanyaan</p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto" onScroll={handleScroll}>
              {questions.map((question) => (
                <Card key={question.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium leading-relaxed mb-2">{question.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            question.category_id === 2 ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {question.category_id === 2 ? "Pasangan" : "Teman"}
                        </span>
                        <span>Dibuat pada {dateFormat(question.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {isLoadingQuestions && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              )}

              {!hasMoreQuestions && questions.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">  Tidak ada pertanyaan lagi untuk ditampilkan</div>
              )}
            </div>

            {/* Back Button */}
            <Button onClick={() => setCurrentScreen("landing")} variant="ghost" className="w-full mt-6 text-gray-600">
              Kembali ke menu utama
            </Button>

            {/* Create Question Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Yuk buat pertanyaan baru</h3>
                      <Button
                        onClick={() => {
                          setShowCreateModal(false)
                          setFormErrors({})
                          setInputText("")
                          setNewQuestion({ title: "", category_id: 2 })
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </Button>
                    </div>

                    <form onSubmit={handleCreateQuestion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <select
                          value={newQuestion.category_id}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              category_id: parseInt(e.target.value),
                            }))
                          }
                          className="w-full h-12 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="2">❤️ Pasangan</option>
                          <option value="1">🤝 Teman</option>
                        </select>
                        {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          // onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Masukkan ide pertanyaan kamu..."
                          rows={4}
                          className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false)
                            setFormErrors({})
                            setInputText("")
                            setNewQuestion({ title: "", category_id: 2 })
                          }}
                          variant="outline"
                          className="flex-1 h-12 rounded-xl"
                        >
                          Tutup
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                        >
                          {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Session End Screen */}
      {currentScreen === "session-end" && (
        <div className="flex flex-col items-center justify-center min-h-screen pb-16 p-6 text-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Sesi yang Seru!</h2>
              <p className="text-lg text-gray-600 mb-6">Gimana perasaan kamu setelah ngobrol bareng?</p>

              <div className="flex justify-center space-x-4 mb-8">
                <button className="text-4xl hover:scale-110 transition-transform">😊</button>
                <button className="text-4xl hover:scale-110 transition-transform">🥰</button>
                <button className="text-4xl hover:scale-110 transition-transform">🤗</button>
                <button className="text-4xl hover:scale-110 transition-transform">💕</button>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={playAgain}
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Main Lagi
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl bg-transparent"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Bagikan Pengalamanmu
              </Button>
              {/* Footer */}
              <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
                <p className="text-xs text-gray-500">
                  © {new Date().toLocaleDateString('id-ID', {
                    year: 'numeric'
                  })}{' '}
                  <a
                    href="https://brogrammer.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Brogrammer.id
                  </a>. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
    </>
  )
}
