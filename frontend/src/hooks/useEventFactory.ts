"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/contracts';
import { parseAbiItem } from 'viem';

/**
 * Hook to get all events from EventFactory
 */
export function useGetAllEvents() {
    const { data: eventAddresses, isLoading, error, refetch } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getAllEvents',
    });

    return {
        eventAddresses: eventAddresses as string[] | undefined,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get events created by a specific organizer
 */
export function useGetOrganizerEvents(organizerAddress?: string) {
    const { data: eventAddresses, isLoading, error } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getOrganizerEvents',
        args: organizerAddress ? [organizerAddress] : undefined,
    });

    return {
        eventAddresses: eventAddresses as string[] | undefined,
        isLoading,
        error,
    };
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const createEvent = (params: {
        name: string;
        symbol: string;
        eventName: string;
        eventDate: number; // Unix timestamp
        eventLocation: string;
        ticketPrice: bigint; // In wei
        maxResalePrice: bigint; // In wei
        royaltyPercentage: number; // Basis points (e.g., 500 = 5%)
        totalTickets: number;
    }) => {
        writeContract({
            address: CONTRACTS.EventFactory.address as `0x${string}`,
            abi: CONTRACTS.EventFactory.abi,
            functionName: 'createEvent',
            args: [
                params.name,
                params.symbol,
                params.eventName,
                BigInt(params.eventDate),
                params.eventLocation,
                params.ticketPrice,
                params.maxResalePrice,
                params.royaltyPercentage,
                params.totalTickets,
            ],
        });
    };

    return {
        createEvent,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to get total number of events
 */
export function useGetTotalEvents() {
    const { data: total, isLoading, error } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getTotalEvents',
    });

    return {
        total: total ? Number(total) : 0,
        isLoading,
        error,
    };
}
