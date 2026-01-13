'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/actions/order';
import { ORDER_STATUS_CONFIG, type Order, type OrderStatus } from '@/lib/types';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getOrders({
      status: statusFilter || undefined,
      search: search || undefined,
    });
    if (result.success && result.orders) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">주문 관리</h1>
          <Link href="/" className="btn btn-ghost btn-sm">
            홈으로
          </Link>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              >
                <option value="">전체 상태</option>
                {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <input
                  type="text"
                  placeholder="주문번호, 고객명, 연락처 검색"
                  className="input input-bordered flex-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  검색
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 opacity-70">
                주문이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>주문자</th>
                      <th>연락처</th>
                      <th>금액</th>
                      <th>상태</th>
                      <th>주문일</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono">{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_phone}</td>
                        <td>{order.total_price.toLocaleString()}원</td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === 'pending_payment'
                                ? 'badge-warning'
                                : order.status === 'cancelled'
                                ? 'badge-error'
                                : order.status === 'delivered'
                                ? 'badge-success'
                                : 'badge-info'
                            }`}
                          >
                            {ORDER_STATUS_CONFIG[order.status].label}
                          </span>
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td>
                          <Link
                            href={`/admin/${order.id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            상세
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {!loading && orders.length > 0 && (
          <div className="mt-4 text-sm opacity-70 text-right">
            총 {orders.length}건
          </div>
        )}
      </div>
    </div>
  );
}
