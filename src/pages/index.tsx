"use client"

import { useState } from "react"
import { Heart, Users, ArrowRight, RotateCcw, Share2, Plus, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { reqStartGame } from "@/api/questions"

type Screen = "landing" | "multiplayer-setup" | "game" | "session-end"
type GameMode = "solo" | "multiplayer"
type Category = "couples" | "friends"

const categoryMap: Record<Category, number> = {
  friends: 1,
  couples: 2,
};

interface Question {
  id: number;
  title: string;
}

export default function TalkDeckApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [gameMode, setGameMode] = useState<GameMode>("solo")
  const [category, setCategory] = useState<Category>("couples")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [cardsPlayed, setCardsPlayed] = useState(0)

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

  return (
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
              onClick={() => startGame("multiplayer")}
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

              <Button onClick={() => setCurrentScreen("landing")} variant="ghost" className="w-full text-gray-600">
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
  )
}
