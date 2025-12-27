// socketHandler.js (Backend - à créer dans le dossier racine)

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
      console.log('✅ User connected:', socket.id);
  
      // ========== REJOINDRE UNE POLL ROOM ==========
      socket.on('join-poll-room', (data) => {
        const { roomId, pollId, userId, userName } = data;
        const roomSocketId = `poll-${pollId}-room-${roomId}`;
        
        socket.join(roomSocketId);
        console.log(`📥 User ${userName} (${userId}) joined: ${roomSocketId}`);
        
        // Notifier les autres utilisateurs
        socket.to(roomSocketId).emit('user-joined', { 
          userId, 
          userName,
          pollId: parseInt(pollId)
        });
      });
  
      // ========== QUITTER UNE POLL ROOM ==========
      socket.on('leave-poll-room', (data) => {
        const { roomId, pollId } = data;
        const roomSocketId = `poll-${pollId}-room-${roomId}`;
        
        socket.leave(roomSocketId);
        console.log(`📤 User left: ${roomSocketId}`);
      });
  
      // ========== VOTE CAST - TEMPS RÉEL ==========
      socket.on('vote-cast', (data) => {
        const { roomId, pollId, userId, totalVotes, option1_count, option2_count, option3_count, option4_count } = data;
        const roomSocketId = `poll-${pollId}-room-${roomId}`;
        
        console.log(`🗳️ Vote cast in ${roomSocketId}:`, {
          totalVotes,
          option1_count,
          option2_count,
          option3_count,
          option4_count
        });
        
        // ÉMETTRE À TOUS LES CLIENTS DANS CETTE ROOM (y compris celui qui vote)
        io.to(roomSocketId).emit('vote-updated', {
          pollId: parseInt(pollId),
          totalVotes,
          option1_count,
          option2_count,
          option3_count,
          option4_count
        });
      });
  
      // ========== POLL DÉMARRÉ ==========
      socket.on('poll-started', (data) => {
        const { roomId, pollId } = data;
        const roomSocketId = `poll-${pollId}-room-${roomId}`;
        
        console.log(`▶️ Poll started in ${roomSocketId}`);
        
        io.to(roomSocketId).emit('poll-status-changed', {
          pollId: parseInt(pollId),
          status: 'active'
        });
      });
  
      // ========== POLL FERMÉ ==========
      socket.on('poll-closed', (data) => {
        const { roomId, pollId } = data;
        const roomSocketId = `poll-${pollId}-room-${roomId}`;
        
        console.log(`⏹️ Poll closed in ${roomSocketId}`);
        
        io.to(roomSocketId).emit('poll-status-changed', {
          pollId: parseInt(pollId),
          status: 'closed',
          message: 'Poll has ended'
        });
      });
  
      // ========== DÉCONNEXION ==========
      socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
      });
    });
  };
  
  module.exports = setupSocketHandlers;