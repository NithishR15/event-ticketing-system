import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiDownload, FiArrowLeft, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

function MyBookingDetails() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);

  useEffect(function () {
    bookingService.getBookingById(id).then(function (data) {
      setBooking(data.booking);
    }).catch(function () {
      toast.error('Booking not found');
      navigate('/student/dashboard');
    }).finally(function () {
      setLoading(false);
    });
  }, [id, navigate]);

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function handleDownload() {
    setGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const W = 700;
      const H = 900;
      canvas.width = W;
      canvas.height = H;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // Header band
      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#6366f1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, 130);

      ctx.fillStyle = '#e0e7ff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET CONFIRMED', W / 2, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      wrapText(ctx, booking.event.title, W / 2, 85, W - 80, 32);

      // Avatar (circle) + name
      const avatarUrl = user.avatar
        ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + user.avatar
        : null;
      const avatarImg = avatarUrl ? await loadImage(avatarUrl) : null;

      const avatarX = W / 2;
      const avatarY = 190;
      const avatarR = 45;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = '#e0e7ff';
      ctx.fill();
      if (avatarImg) {
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      } else {
        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(user.name.charAt(0).toUpperCase(), avatarX, avatarY + 2);
      }
      ctx.restore();

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(user.name, W / 2, 260);

      ctx.fillStyle = '#6b7280';
      ctx.font = '13px Arial';
      ctx.fillText(user.email, W / 2, 280);

      // Divider
      ctx.strokeStyle = '#e5e7eb';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(40, 305);
      ctx.lineTo(W - 40, 305);
      ctx.stroke();
      ctx.setLineDash([]);

      // QR code
      const qrImg = await loadImage(booking.qrCode);
      const qrSize = 240;
      const qrX = W / 2 - qrSize / 2;
      const qrY = 330;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12);
      ctx.fill();
      ctx.stroke();

      if (qrImg) {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      // Ticket ID
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(booking.ticketId, W / 2, qrY + qrSize + 45);

      // Status badge
      ctx.fillStyle = '#d1fae5';
      const badgeText = booking.status === 'checked-in' ? 'CHECKED IN' : booking.status.toUpperCase();
      ctx.font = 'bold 12px Arial';
      const badgeWidth = ctx.measureText(badgeText).width + 30;
      roundRect(ctx, W / 2 - badgeWidth / 2, qrY + qrSize + 60, badgeWidth, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#065f46';
      ctx.fillText(badgeText, W / 2, qrY + qrSize + 78);

      // Event details
      let detailsY = qrY + qrSize + 120;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#374151';
      ctx.font = '15px Arial';
      ctx.fillText(
        '📅  ' + format(new Date(booking.event.date), 'EEEE, MMM dd, yyyy') + ' · ' + booking.event.time,
        60,
        detailsY
      );
      detailsY += 30;
      ctx.fillText('📍  ' + booking.event.venue, 60, detailsY);

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Present this QR code at the venue entrance for check-in', W / 2, H - 30);

      // Trigger download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'ticket-' + booking.ticketId + '.png';
      link.click();
    } catch (err) {
      toast.error('Failed to generate ticket image');
    } finally {
      setGenerating(false);
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i].trim(), x, startY + i * lineHeight);
    }
  }

  function handleCancel() {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    bookingService.cancelBooking(id).then(function () {
      toast.success('Booking cancelled');
      navigate('/student/dashboard');
    }).catch(function (err) {
      toast.error((err.response && err.response.data && err.response.data.message) || 'Cancellation failed');
    }).finally(function () {
      setCancelling(false);
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) return null;

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    'checked-in': 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-primary-600 text-white p-6 text-center">
          <p className="text-primary-100 text-sm mb-1">Ticket Confirmed</p>
          <h1 className="text-xl font-bold">{booking.event?.title}</h1>
        </div>

        <div className="flex flex-col items-center p-8 border-b border-dashed border-gray-200 dark:border-gray-800">
          <img src={booking.qrCode} alt="QR Ticket" className="w-56 h-56 border-4 border-white shadow-md rounded-lg" />
          <p className="mt-4 font-mono text-lg font-semibold text-gray-900 dark:text-white">{booking.ticketId}</p>
          <span className={'mt-2 text-xs font-medium px-3 py-1 rounded-full ' + (statusColors[booking.status] || 'bg-gray-100 text-gray-700')}>
            {booking.status === 'checked-in' ? 'Checked In' : booking.status}
          </span>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <FiCalendar className="w-4 h-4 text-primary-600" />
            {booking.event?.date && format(new Date(booking.event.date), 'EEEE, MMM dd, yyyy')} · {booking.event?.time}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <FiMapPin className="w-4 h-4 text-primary-600" />
            {booking.event?.venue}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={handleDownload} disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
            <FiDownload className="w-4 h-4" />
            {generating ? 'Generating...' : 'Download Ticket'}
          </button>
          {booking.status === 'confirmed' && (
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50">
              <FiXCircle className="w-4 h-4" />
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyBookingDetails;